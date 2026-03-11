export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { auth } = await import('@/lib/auth');

    try {
      await auth.api.createUser({
        body: {
          email: 'jkriddle@gmail.com',
          password: 'R1ddl3br0s',
          name: 'jkriddle'
        }
      });
      console.log('Seed: user jkriddle@gmail.com created.');
    } catch {
      // User already exists or DB not ready - that's fine
    }
  }
}
