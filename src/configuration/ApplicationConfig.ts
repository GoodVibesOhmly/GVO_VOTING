
interface Strategy {
  name: string,
  params: any,
}

interface SpaceConfig {
  name: string,
  destination?: string,
  filter: (data: any) => boolean,
  voteClose: number
}

interface SnapshotConfig {
  space: string,
  strategies: Strategy[],
  network: string,
  plugins: any,
  metadata: any,
}

interface ApplicationConfig {
  spaces: Map<string,SpaceConfig>,
  snapshotConfig: SnapshotConfig,
  discordChannelId: string
}

const allowAll = (data: any) => true;
const twoHoursS = 2*60*60;

export const config: ApplicationConfig = {
  spaces: new Map<string,SpaceConfig>([
    [
      'frax.eth', {
        name: 'Frax',
        destination: 'fabien.eth',
        voteClose: twoHoursS,
        filter: allowAll
      }
    ]
  ]),
  snapshotConfig: {
    space:'fabien.eth',
    strategies: [
        {
          name: 'erc20-balance-of',
          params: {
            symbol: 'sLOBI',
            address: '0x8ab17e2cd4f894f8641a31f99f673a5762f53c8e',
            decimals: 9
          }
        }
    ],
    network: '1',
    plugins: {},
    metadata: {}
  },
  discordChannelId: '912732018465452042'
}

export default config;