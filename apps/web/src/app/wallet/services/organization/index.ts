import { authHttp } from 'src/interfaces/http'

import { GetOrganizationsResult, IOrganizationService } from './types'

export class OrganizationService implements IOrganizationService {
  async getOrganizations(): Promise<GetOrganizationsResult> {
    const response = await authHttp.get('/api/ngos')

    return response.data
  }
}

const organizationService = new OrganizationService()

export { organizationService }
