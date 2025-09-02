import { IHTTPResponse } from 'src/interfaces/http/types'

import { Organization } from '../../domain/models/organization'

export interface IOrganizationService {
  getOrganizations: () => Promise<GetOrganizationsResult>
}

export type GetOrganizationsResult = IHTTPResponse<{
  ngos: Organization[]
}>
