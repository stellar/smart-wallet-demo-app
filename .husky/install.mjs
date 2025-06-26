try {
  if (process.env.DEPLOY_STAGE === 'remote') {
    console.log('Skipping Husky installation in remote deployment stage.');
    process.exit(0);
  }

  const husky = (await import('husky')).default;
  console.log(husky());
} catch (error) {
  console.warn('Husky installation failed, but continuing:', error);
  process.exit(0);
}
