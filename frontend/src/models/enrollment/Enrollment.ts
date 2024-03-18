import { ISOtoString } from '@/services/ConvertDateService';
import Activity from '@/models/activity/Activity';

export default class Enrollment {
  id: number | null = null;
  motivation!: string;
  enrollmentDateTime!: string;
  activityId!: number;

  constructor(jsonObj?: Enrollment) {
    if (jsonObj) {
      this.id = jsonObj.id;
      this.motivation = jsonObj.motivation;
      this.enrollmentDateTime = ISOtoString(jsonObj.enrollmentDateTime);
      this.activityId = jsonObj.activityId;
    }
  }
}
