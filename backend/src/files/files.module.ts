import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesGuestController } from './files.guest.controller';
import { FilesService } from './files.service';
import { FilesGuestService } from './files.guest.service';
import { DriveModule } from '../drive/drive.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DriveModule, AuthModule],
  controllers: [FilesController, FilesGuestController],
  providers: [FilesService, FilesGuestService]
})
export class FilesModule {}
