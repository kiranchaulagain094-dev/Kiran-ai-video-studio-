import { handleHealthCheck } from './index';

export default function handler(req: any, res: any) {
  return handleHealthCheck(req, res);
}
