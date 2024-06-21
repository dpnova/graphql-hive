import { HiveError } from '../../shared/errors';
import { IdTranslator } from '../shared/providers/id-translator';
import { CdnModule } from './__generated__/types';
import { CdnProvider } from './providers/cdn.provider';

export const resolvers: CdnModule.Resolvers = {
  Mutation: {
    createCdnAccessToken: async (_, { input }, { injector }) => {
      const translator = injector.get(IdTranslator);
      const cdn = injector.get(CdnProvider);

      if (cdn.isEnabled() === false) {
        throw new HiveError(`CDN is not configured, cannot generate a token.`);
      }

      const [organizationId, projectId, targetId] = await Promise.all([
        translator.translateOrganizationId(input.selector),
        translator.translateProjectId(input.selector),
        translator.translateTargetId(input.selector),
      ]);

      const result = await cdn.createCDNAccessToken({
        organizationId,
        projectId,
        targetId,
        alias: input.alias,
      });

      if (result.type === 'failure') {
        return {
          error: {
            message: result.reason,
          },
        };
      }

      return {
        ok: {
          secretAccessToken: result.secretAccessToken,
          createdCdnAccessToken: result.cdnAccessToken,
          cdnUrl: cdn.getCdnUrlForTarget(targetId),
        },
      };
    },
  },
};
