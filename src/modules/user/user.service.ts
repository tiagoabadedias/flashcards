import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async create(userData: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async findOrCreate(googleProfile: any): Promise<UserDocument> {
    const { id, emails, displayName, photos } = googleProfile;
    const email = emails[0].value;
    const avatar = photos[0]?.value;

    let user = await this.findByEmail(email);

    if (!user) {
      user = await this.create({
        email,
        googleId: id,
        name: displayName,
        avatar,
      });
    } else if (!user.googleId) {
      // Se o usuário existe mas não tem googleId (ex: criado por outra forma), atualiza
      user.googleId = id;
      if (!user.avatar) user.avatar = avatar;
      await user.save();
    }

    return user;
  }

  async completeOnboarding(userId: string, onboardingVersion: number): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            onboarding: {
              version: onboardingVersion,
              completed: true,
              completedAt: new Date(),
            },
          },
        },
        { new: true },
      )
      .exec();
  }
}
