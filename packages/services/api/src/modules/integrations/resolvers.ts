import { OrganizationManager } from '../organization/providers/organization-manager';
import { IdTranslator } from '../shared/providers/id-translator';
import type { IntegrationsModule } from './__generated__/types';
import { GitHubIntegrationManager } from './providers/github-integration-manager';
import { SlackIntegrationManager } from './providers/slack-integration-manager';

export const resolvers: IntegrationsModule.Resolvers = {
  Mutation: {
    async addGitHubIntegration(_, { input }, { injector }) {
      const organization = await injector.get(IdTranslator).translateOrganizationId(input);

      await injector.get(GitHubIntegrationManager).register({
        organization,
        installationId: input.installationId,
      });

      return true;
    },
    async deleteGitHubIntegration(_, { input }, { injector }) {
      const organizationId = await injector.get(IdTranslator).translateOrganizationId(input);

      await injector.get(GitHubIntegrationManager).unregister({
        organization: organizationId,
      });

      const organization = await injector.get(OrganizationManager).getOrganization({
        organization: organizationId,
      });
      return { organization };
    },
    async enableProjectNameInGithubCheck(_, { input }, { injector }) {
      const translator = injector.get(IdTranslator);
      const [organization, project] = await Promise.all([
        translator.translateOrganizationId(input),
        translator.translateProjectId(input),
      ]);
      return injector.get(GitHubIntegrationManager).enableProjectNameInGithubCheck({
        organization,
        project,
      });
    },
  },
  Query: {
    isGitHubIntegrationFeatureEnabled(_, __, { injector }) {
      return injector.get(GitHubIntegrationManager).isEnabled();
    },
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
