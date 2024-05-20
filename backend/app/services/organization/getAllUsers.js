import of from 'await-of';
import ActionBase from '../../utils/actionBase';
import { argumentsValidator } from '../../utils/decorators/argumentsValidator';
import responseHelper from '../../helpers/responseHelper';
import { BuildAndSendTransactionService } from '../blockchain';
import checkPaginationFields from '../../helpers/checkPaginationFields';
import { log } from '../../utils/decorators/log';
import GetUser from '../user/getUser';
import Logger from '../../../server/logger';

const schema = {
  page_number: { type: 'string', optional: true },
  page_offset: { type: 'string', optional: true },
  keycloakSubId: { type: 'string' }
};

@log
export default class GetAllUsersService extends ActionBase {
  @argumentsValidator(schema)
  async perform(
    { page_number: pageNumber, page_offset: pageOffset, keycloakSubId },
    ctx
  ) {
    checkPaginationFields(pageOffset, pageNumber);
    pageOffset = parseInt(pageOffset) || 10;
    pageNumber = parseInt(pageNumber) || 1;

    //get user
    const user = await GetUser.perform({ keycloakId: keycloakSubId });
    if (!user) {
      throw new Error(`User ${keycloakSubId} not found`);
    }

    const payload = {
      action: 'get_all_users'
    };

    const [response, error] = await of(
      BuildAndSendTransactionService.perform({
        payload,
        uuid: user.blockchainId
      })
    );

    if (error) {
      ctx.logger.error('Could not fetch Users', error);
      throw new Error(`Could not fetch Users`);
    }

    //customize response
    await this.customizeResponse(response.users)

    return responseHelper(
      {
        message: 'Users have been successfully fetched',
        page_offset: pageOffset,
        page_number: pageNumber,
        total_page: Math.ceil(response.totalNoOfUsers / pageOffset)
      },
      response.users
    );
  }

  async customizeResponse(users) {
    users.forEach(user => {
      delete user.parties;
      delete user.adminPublicKey;
    })
  }
}
