function sleep(s: number): Promise<void> {
  return new Promise((r) => setTimeout(r, s * 1000));
}

export async function until(condition: () => boolean, attempt: () => void, pause: number = 1): Promise<void> {
  await attempt();
  while (!condition()) {
    await sleep(pause);
    await attempt();
  }
}

export function mergeVariablesWithEnvString(variables: Record<string, unknown>, env: string): string {
  return Object.entries(variables).reduce((env, [key, value]) => {
    if (new RegExp(`${key}=`, 'g').test(env)) {
      return env.replace(new RegExp(`${key}=.*?\n`), `${key}=${value}\n`);
    }
    return `${env}${key}=${value}\n`;
  }, env);
}

// function serverWithFewestSites(servers: Server[], sites: Site[]): Server {
//   const serverSites = sites.reduce((carry: { [_: string]: number }, site: Site) => {
//     carry[site.server_id] ??= 0;
//     carry[site.server_id]++;
//     return carry;
//   }, {});

//   let count = 0;
//   const server = Object.entries(serverSites).reduce((carry: string, server: [string, number]): string => {
//     try {
//       return server[1] < count ? server[0] : carry;
//     } finally {
//       count = server[1];
//     }
//   }, Object.keys(serverSites)[0]);

//   return servers.find(({ id }) => id === Number(server));
// }
