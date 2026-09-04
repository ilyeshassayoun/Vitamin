export function getRuntimeEnv(name: string): string | undefined {
  return Reflect.get(process.env, name) as string | undefined;
}
