import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';

import { Config } from '../config';
import { matcherRegexAny } from './utils';

export default async function match(client: InstanceType<typeof GitHub>, config: Config): Promise<string[]> {
  const number = github.context.payload.pull_request?.number;

  if (!number) {
    return [];
  }

  const matchers = config.labels!.filter((value) => {
    return value.matcher?.commits;
  });

  if (!matchers.length) {
    return [];
  }

  const responses = await client.paginate(
    client.rest.pulls.listCommits.endpoint.merge({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      pull_number: number,
    }),
  );

  const messages: string[] = responses.map((c: any) => c.commit.message);

  return matchers
    .filter((value) => {
      return matcherRegexAny(value.matcher!.commits!, messages);
    })
    .map((value) => value.label);
}
