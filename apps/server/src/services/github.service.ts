export class GitHubService {
  private token: string;
  private orgName: string;

  constructor() {
    this.token = process.env.GITHUB_TOKEN || '';
    this.orgName = process.env.GITHUB_ORG || 'boulot-platform';
  }

  /**
   * Provisions a real GitHub repository for a project using the GitHub API.
   * Invites all participants: student (push), SME (pull), mentor (pull).
   */
  async provisionRepository(
    projectName: string,
    collaborators: { username: string; permission: 'push' | 'pull' | 'admin' }[]
  ): Promise<string> {
    if (!this.token) {
      const collabNames = collaborators.map(c => `${c.username}(${c.permission})`).join(', ');
      console.warn(`[GitHub Mock] Creating repo 'boulot/${projectName}' with collaborators: ${collabNames}`);
      return `https://github.com/${this.orgName}/${projectName.toLowerCase().replace(/\s+/g, '-')}`;
    }

    const repoName = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    console.log(`[GitHub API] Creating repo ${repoName} in org ${this.orgName}...`);

    // Create the repo
    const createRes = await fetch(`https://api.github.com/orgs/${this.orgName}/repos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        private: true,
        auto_init: true,
      }),
    });

    if (!createRes.ok) {
      const err: any = await createRes.json();
      throw new Error(`Failed to create repository: ${err.message}`);
    }

    const repoData: any = await createRes.json();
    const repoUrl = repoData.html_url;

    // Add all collaborators with their respective permissions
    for (const collab of collaborators) {
      if (!collab.username) continue;
      console.log(`[GitHub API] Adding collaborator ${collab.username} with ${collab.permission} access...`);
      try {
        await fetch(`https://api.github.com/repos/${this.orgName}/${repoName}/collaborators/${collab.username}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({ permission: collab.permission }),
        });
      } catch (err) {
        console.warn(`[GitHub API] Failed to add collaborator ${collab.username}:`, err);
      }
    }

    return repoUrl;
  }

  /**
   * Sets up a webhook for a repository to track pushes
   */
  async setupWebhook(repositoryUrl: string): Promise<boolean> {
    if (!this.token) {
      console.warn(`[GitHub Mock] Setting up PR/Commit webhooks for ${repositoryUrl}`);
      return true;
    }

    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('GITHUB_WEBHOOK_SECRET is required to set up GitHub webhooks');
    }
    const serverUrl = process.env.API_BASE_URL || 'https://api.boulot.com';
    
    const repoPath = repositoryUrl.replace('https://github.com/', '');
    
    console.log(`[GitHub API] Setting up webhook for ${repoPath}...`);
    
    const res = await fetch(`https://api.github.com/repos/${repoPath}/hooks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['push', 'pull_request'],
        config: {
          url: `${serverUrl}/api/webhooks/github`,
          content_type: 'json',
          secret: webhookSecret,
          insecure_ssl: '0'
        }
      }),
    });

    if (!res.ok) {
      console.error('Failed to create webhook:', await res.json());
      return false;
    }

    return true;
  }
}
