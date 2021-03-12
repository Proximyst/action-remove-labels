import * as github from '@actions/github';
import * as core from '@actions/core';

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github_token', { required: true });

    const labels = core
      .getInput('labels')
      .split('\n')
      .filter(l => l !== '');
    const [owner, repo] = core.getInput('repo').split('/');
    const number =
      core.getInput('number') === ''
        ? github.context.issue.number
        : parseInt(core.getInput('number'));

    if (labels.length === 0) {
      return;
    }

    const client = github.getOctokit(githubToken);

    const existing = (
      await client.issues.listLabelsOnIssue({
        owner,
        repo,
        issue_number: number
      })
    ).data.map(d => d.name);

    const remaining = labels.filter(l => existing.includes(l));

    for (const label of remaining) {
      await client.issues.removeLabel({
        name: label,
        owner,
        repo,
        issue_number: number
      });
    }
  } catch (e) {
    core.error(e);

    if (core.getInput('fail_on_error') === 'true') {
      core.setFailed(e.message);
    }
  }
}

run();
