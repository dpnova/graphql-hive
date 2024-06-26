import type { IntegrationsModule } from './__generated__/types';
import { GitHubIntegrationManager } from './providers/github-integration-manager';
import { SlackIntegrationManager } from './providers/slack-integration-manager';

export const resolvers: IntegrationsModule.Resolvers = {
  Query: {
    organizationByGitHubInstallationId(_, { installation }, { injector }) {
      return injector.get(GitHubIntegrationManager).getOrganization({
        installation,
      });
    },
  },
  Organization: {
    hasSlackIntegration(organization, _, { injector }) {
      return injector.get(SlackIntegrationManager).isAvailable({
        organization: organization.id,
      });
    },
    hasGitHubIntegration(organization, _, { injector }) {
      return injector.get(GitHubIntegrationManager).isAvailable({
        organization: organization.id,
      });
    },
    async gitHubIntegration(organization, _, { injector }) {
      const repositories = await injector.get(GitHubIntegrationManager).getRepositories({
        organization: organization.id,
      });

      if (repositories == null) {
        return null;
      }

      return {
        repositories,
      };
    },
  },
  Project: {
    isProjectNameInGitHubCheckEnabled(project) {
      return project.useProjectNameInGithubCheck;
    },
  },
};
