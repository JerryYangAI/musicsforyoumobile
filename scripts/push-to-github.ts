import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

function getAllFiles(dir: string, baseDir: string): string[] {
  const files: string[] = [];
  const ignoreDirs = ['node_modules', '.git', '.cache', 'dist', '.config', 'uploads', '.upm'];
  
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoreDirs.includes(entry.name)) continue;
    if (entry.name.startsWith('.') && entry.name !== '.gitignore') continue;
    
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);
    
    if (entry.isDirectory()) {
      if (entry.name === 'mobile' && fs.existsSync(path.join(fullPath, 'node_modules'))) {
        const mobileFiles = getAllFiles(fullPath, baseDir);
        files.push(...mobileFiles);
      } else {
        files.push(...getAllFiles(fullPath, baseDir));
      }
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.mp3', '.mp4', '.wav'];
      if (!binaryExts.includes(ext)) {
        files.push(relPath);
      } else {
        files.push(relPath);
      }
    }
  }
  return files;
}

async function main() {
  const accessToken = await getAccessToken();
  const octokit = new Octokit({ auth: accessToken });

  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);

  const owner = user.login;
  const repo = 'MusicsForYou';

  let repoExists = false;
  try {
    await octokit.repos.get({ owner, repo });
    repoExists = true;
    console.log(`Repository ${repo} already exists.`);
  } catch (e: any) {
    if (e.status === 404) {
      console.log(`Creating repository ${repo}...`);
      await octokit.repos.createForAuthenticatedUser({
        name: repo,
        description: 'AI-powered music generation platform with voice cloning - Web & Mobile App',
        private: false,
      });
      console.log(`Repository created!`);
    } else {
      throw e;
    }
  }

  const baseDir = '/home/runner/workspace';
  console.log('Scanning files...');
  const allFiles = getAllFiles(baseDir, baseDir);
  console.log(`Found ${allFiles.length} files to push.`);

  const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.mp3', '.mp4', '.wav'];
  
  const treeItems: any[] = [];
  
  for (const filePath of allFiles) {
    const fullPath = path.join(baseDir, filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    try {
      if (binaryExts.includes(ext)) {
        const content = fs.readFileSync(fullPath);
        const { data: blob } = await octokit.git.createBlob({
          owner,
          repo,
          content: content.toString('base64'),
          encoding: 'base64',
        });
        treeItems.push({
          path: filePath,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blob.sha,
        });
        console.log(`  [binary] ${filePath}`);
      } else {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const { data: blob } = await octokit.git.createBlob({
          owner,
          repo,
          content,
          encoding: 'utf-8',
        });
        treeItems.push({
          path: filePath,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blob.sha,
        });
        console.log(`  [text] ${filePath}`);
      }
    } catch (err) {
      console.log(`  [skip] ${filePath}: ${err}`);
    }
  }

  console.log(`\nCreating tree with ${treeItems.length} items...`);
  const { data: tree } = await octokit.git.createTree({
    owner,
    repo,
    tree: treeItems,
  });

  console.log('Creating commit...');
  const { data: commit } = await octokit.git.createCommit({
    owner,
    repo,
    message: 'MusicsForYou - AI music generation platform with voice cloning\n\nFull-stack web app + React Native mobile app\n- Phone-based authentication with JWT\n- AI music generation with credits system\n- Voice cloning and recording\n- Dark cyberpunk theme',
    tree: tree.sha,
    parents: [],
  });

  console.log('Updating main branch...');
  try {
    await octokit.git.updateRef({
      owner,
      repo,
      ref: 'heads/main',
      sha: commit.sha,
      force: true,
    });
  } catch {
    await octokit.git.createRef({
      owner,
      repo,
      ref: 'refs/heads/main',
      sha: commit.sha,
    });
  }

  console.log(`\nDone! Project pushed to: https://github.com/${owner}/${repo}`);
}

main().catch(console.error);
