import { getRepository, Repository } from 'typeorm';

import { User } from '../../../users/entities/User';
import { Game } from '../../entities/Game';

import { IGamesRepository } from '../IGamesRepository';

export class GamesRepository implements IGamesRepository {
  private repository: Repository<Game>;

  constructor() {
    this.repository = getRepository(Game);
  }

  async findByTitleContaining(param: string): Promise<Game[]> {
    return this.repository
      .createQueryBuilder('game')
      .where("LOWER(game.title) like :param", { param: `%${param}%` })
      .orWhere("UPPER(game.title) like :param", { param: `%${param}%` })
      .getMany();
  }

  async countAllGames(): Promise<[{ count: string }]> {
    const count = await this.repository.count();

    return [{ count: String(count) }]
  }

  async findUsersByGameId(id: string): Promise<User[]> {
    const game = await this.repository.findOne({
      where: {
        id
      },
      relations: ['users']
    })

    const uniqueUsers: User[] = []

    game?.users.forEach(user => {
      if (!uniqueUsers.find(uniqueUser => uniqueUser.id === user.id)) {
        uniqueUsers.push(user)
      }
    })

    return uniqueUsers
  }
}
