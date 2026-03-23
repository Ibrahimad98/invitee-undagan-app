import { Module } from '@nestjs/common';
import { BugFeedbackController } from './bug-feedback.controller';
import { BugFeedbackService } from './bug-feedback.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [BugFeedbackController],
  providers: [BugFeedbackService],
  exports: [BugFeedbackService],
})
export class BugFeedbackModule {}
