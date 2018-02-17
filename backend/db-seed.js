import dbReady from './db-init';
import { log, colors } from 'gulp-util';

async function create(Model, values, logMsg) {
  try {
    const mod = await Model.saveCreate(values);
    logMsg && log(colors.green(logMsg));
    return mod;
  } catch (err) {
    log(colors.red(err))
  }
}

export default function seed(callback) {
  dbReady(async(db) => {
    log(colors.cyan('Refreshing and seeding the database...'));

    const { Users, Sessions } = db;

    // Drop existing tables and create schema
    await db.getSQConnection().sync({ force: true });

    // Example.
    // Note that a user record is necessary for
    // authentication to work.
    await create(Users, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'fake@fake.com',
      password: [ // Password0!!!
        '80faf27d9f9cf1d549949135e598f60364518464c534865028ec86e7270efd3b8d5739f',
        '5429e9c153d46b02467f7fa1159beaf55dbe9618afac73f8cfb101b07806eff7a509033',
        '2a5a6736fd7dee78255805bedbba9c1c0d666164337975e54605b627cac2838d12df48e',
        'e84c0994ea5a2d3ddde73d6117df0ac5b746600814114ea39501f61da691a342026e436',
        '809a3120ca0d8d0591a42df17535dc0b93ca5dc75dbab542eaf3d319b5c92c5d6414495',
        '770c10f60895cd2b49678d6796b845e14b3de05f0a5dc34e290d231aac1781b13f6ed53',
        '6239e2a108cef7d077b716ff89d0ad2b6509e9c947529c57b03060fc3a6dc398a70f036',
        '28aab5dbba24540dd88bb9afa185dbc1620938b314504f570012e2b665a59ad53a444f3',
        '5591ca55d30c0a5db4538c3ce2fe9cbce0c468bba1610043f194eead9af6076fe62d04b',
        'c002a0d3c7ed05280000180f310c307f3e3ed0ee2202e0f1a4ce76cc4d20b3ca4ce26a1',
        'ef42ed33f617b6d2899229d1e3c023c7d886d31766d3605d22b186d36ac7fd696a2c037',
        '336eb8b81da5f7b1cec2491c5b6736a549a3cb809c4d8ef0c1cef0412c5977477c8ad68',
        '256d086fa19b63ab4992bef83b0818c7c2af5f649162fb9c227e9d9a963cc4c76f44e20',
        'f0163b8fa43979861ab139e4c782f3b421c16dffcbf42ed1f419d9f8c5cdf088e506728',
        'f0d09945967a10bac9e155e60df249'
      ].join(''),
      pwdSalt: [ 203, 70, 171, 204, 188, 88, 218, 254, 168, 59, 72, 86, 242, 96, 4, 160 ],
      pwdIterations: 100000
    }, 'Created user John Doe');

    // Example.
    await create(Users, {
      firstName: 'David',
      lastName: 'Cohen',
      email: 'example@example.com',
      password: [ // Password0!!!
        '80faf27d9f9cf1d549949135e598f60364518464c534865028ec86e7270efd3b8d5739f',
        '5429e9c153d46b02467f7fa1159beaf55dbe9618afac73f8cfb101b07806eff7a509033',
        '2a5a6736fd7dee78255805bedbba9c1c0d666164337975e54605b627cac2838d12df48e',
        'e84c0994ea5a2d3ddde73d6117df0ac5b746600814114ea39501f61da691a342026e436',
        '809a3120ca0d8d0591a42df17535dc0b93ca5dc75dbab542eaf3d319b5c92c5d6414495',
        '770c10f60895cd2b49678d6796b845e14b3de05f0a5dc34e290d231aac1781b13f6ed53',
        '6239e2a108cef7d077b716ff89d0ad2b6509e9c947529c57b03060fc3a6dc398a70f036',
        '28aab5dbba24540dd88bb9afa185dbc1620938b314504f570012e2b665a59ad53a444f3',
        '5591ca55d30c0a5db4538c3ce2fe9cbce0c468bba1610043f194eead9af6076fe62d04b',
        'c002a0d3c7ed05280000180f310c307f3e3ed0ee2202e0f1a4ce76cc4d20b3ca4ce26a1',
        'ef42ed33f617b6d2899229d1e3c023c7d886d31766d3605d22b186d36ac7fd696a2c037',
        '336eb8b81da5f7b1cec2491c5b6736a549a3cb809c4d8ef0c1cef0412c5977477c8ad68',
        '256d086fa19b63ab4992bef83b0818c7c2af5f649162fb9c227e9d9a963cc4c76f44e20',
        'f0163b8fa43979861ab139e4c782f3b421c16dffcbf42ed1f419d9f8c5cdf088e506728',
        'f0d09945967a10bac9e155e60df249'
      ].join(''),
      pwdSalt: [ 203, 70, 171, 204, 188, 88, 218, 254, 168, 59, 72, 86, 242, 96, 4, 160 ],
      pwdIterations: 100000
    }, 'Created user David Cohen');


    /******************************
     * Create your data here
     ******************************/

    // Necessary for the seed task to exit properly
    return callback && callback();

  });
}
