import { ReflectMetadata } from '@vision/common';

type ApplicationRoles = 'customerclub' | 'clubmanager' | 'agent' | 'admin';

const Roles1 = (...roles: ApplicationRoles[]) => ReflectMetadata('roles', roles);
export const Roles = Roles1;
