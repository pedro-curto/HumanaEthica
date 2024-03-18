<template>
  <div>
    <v-card class="table">
      <v-data-table
        :headers="headers"
        :items="activities"
        :search="search"
        disable-pagination
        :hide-default-footer="true"
        :mobile-breakpoint="0"
        data-cy="volunteerActivitiesTable"
      >
        <template v-slot:top>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="search"
              label="Search"
              class="mx-2"
            />
            <v-spacer />
          </v-card-title>
        </template>
        <template v-slot:[`item.themes`]="{ item }">
          <v-chip v-for="theme in item.themes" v-bind:key="theme.id">
            {{ theme.completeName }}
          </v-chip>
        </template>
        <template v-slot:[`item.action`]="{ item }">
          <v-tooltip bottom>
            <template
              v-if="item.state === 'APPROVED' &&
                isActivityActive(item) &&
                isVolunteerEnrolledInActivity(item)"
              v-slot:activator="{ on }">
              <v-icon
                class="mr-2 action-button"
                color="orange"
                v-on="on"
                @click="enrollInActivity(item)"
                >fa-solid fa-id-card-clip
              </v-icon>
            </template>
            <span>Apply for Activity</span>
          </v-tooltip>
          <v-tooltip v-if="item.state === 'APPROVED'" bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                class="mr-2 action-button"
                color="red"
                v-on="on"
                data-cy="reportButton"
                @click="reportActivity(item)"
                >warning</v-icon
              >
            </template>
            <span>Report Activity</span>
          </v-tooltip>
          <v-tooltip v-if="checkVolunteerParticipations(item) && activityIsOver(item) && !checkVolunteerAssessedInstitution(item)" bottom>
            <template v-slot:activator="{ on }">
              <v-icon
                class="mr-2 action-button"
                color="blue"
                v-on="on"
                data-cy="writeAssessmentButton"
                @click="writeAssessment(item)"
                >fa-solid fa-pen-to-square</v-icon>
            </template>
            <span>Write Assessment</span>
          </v-tooltip>
        </template>
      </v-data-table>
      <assessment-dialog
          v-if="currentInstitutionId && writeAssessmentDialog"
          v-model="writeAssessmentDialog"
          :institutionId="currentInstitutionId"
          v-on:close-assessment-dialog="onCloseAssessmentDialog"
          v-on:save-assessment="onSaveAssessment"
      />
      <enrollment-dialog
        v-if="currentActivity && editEnrollmentDialog"
        v-model="editEnrollmentDialog"
        :activity="currentActivity"
        v-on:save-enrollment="onSaveEnrollment"
        v-on:close-enrollment-dialog="onCloseEnrollmentDialog"
      />
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import Activity from '@/models/activity/Activity';
import { show } from 'cli-cursor';
import AssessmentDialog from '@/views/volunteer/AssessmentDialog.vue';
import Assessment from '@/models/assessment/Assessment';
import Participation from '@/models/participation/Participation';
import Enrollment from '@/models/enrollment/Enrollment';
//import EnrollmentDialog from '@/views/volunteer/EnrollmentDialog.vue';

@Component({
  components: {
    'assessment-dialog': AssessmentDialog,
  },
  methods: {show},
  /*components: {
    'enrollment-dialog': EnrollmentDialog,
  },*/
  methods: { show },
})
export default class VolunteerActivitiesView extends Vue {
  activities: Activity[] = [];
  assessments: Assessment[] = [];
  volunteerParticipations: Participation[] = [];
  enrollments: Enrollment[] = [];
  search: string = '';
  currentInstitutionId: number | null = null;
  writeAssessmentDialog: boolean = false;

  currentActivity: Activity | null = null;
  editEnrollmentDialog: boolean = false;

  volunteerEnrollments: Enrollment[] = [];

  headers: object = [
    {
      text: 'Name',
      value: 'name',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Region',
      value: 'region',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Participants',
      value: 'participantsNumberLimit',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Themes',
      value: 'themes',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Description',
      value: 'description',
      align: 'left',
      width: '30%',
    },
    {
      text: 'State',
      value: 'state',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Start Date',
      value: 'formattedStartingDate',
      align: 'left',
      width: '5%',
    },
    {
      text: 'End Date',
      value: 'formattedEndingDate',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Application Deadline',
      value: 'formattedApplicationDeadline',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Actions',
      value: 'action',
      align: 'left',
      sortable: false,
      width: '5%',
    },
  ];

  async created() {
    await this.$store.dispatch('loading');
    try {
      this.activities = await RemoteServices.getActivities();
      this.volunteerParticipations = await RemoteServices.getVolunteerParticipations();
      this.assessments = await RemoteServices.getVolunteerAssessments();

      this.volunteerEnrollments =
        await RemoteServices.getVolunteerEnrollments();
    } catch (error) {
      await this.$store.dispatch('error', error);
    }
    await this.$store.dispatch('clearLoading');
  }

  isActivityActive(activity: Activity) {
    return new Date(activity.applicationDeadline) > new Date();
  }

  isVolunteerEnrolledInActivity(activity: Activity) {
    return !this.volunteerEnrollments.some(
      (enrollment) => enrollment.activityId === activity.id,
    );
  }

  async enrollInActivity(activity: Activity) {
    if (activity.id !== null) {
      this.currentActivity = activity;
      this.editEnrollmentDialog = true;
    }
  }

  async reportActivity(activity: Activity) {
    if (activity.id !== null) {
      try {
        const result = await RemoteServices.reportActivity(
          this.$store.getters.getUser.id,
          activity.id,
        );
        this.activities = this.activities.filter((a) => a.id !== activity.id);
        this.activities.unshift(result);
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
    }
  }

  writeAssessment(activity: Activity) {
    this.currentInstitutionId = activity.institution.id;
    this.writeAssessmentDialog = true;
  }

  activityIsOver(activity: Activity) {
    return new Date(activity.endingDate) < new Date();
  }

  checkVolunteerParticipations(activity: Activity) {
    return this.volunteerParticipations.some(
      (participation) => participation.activityId === activity.id,
    );
  }

  checkVolunteerAssessedInstitution(activity: Activity) {
    return this.assessments.some(
      (assessment) => assessment.institutionId === activity.institution.id,
    );
  }

  onCloseAssessmentDialog() {
    this.currentInstitutionId = null;
    this.writeAssessmentDialog = false;
  }

  onSaveAssessment(assessment: Assessment) {
    this.assessments.unshift(assessment);
    this.currentInstitutionId = null;
    this.writeAssessmentDialog = false;
  }

  async onSaveEnrollment(enrollment: Enrollment) {
    this.enrollments.unshift(enrollment);
    this.editEnrollmentDialog = false;
    this.currentActivity = null;
  }

  async onCloseEnrollmentDialog() {
    this.editEnrollmentDialog = false;
    this.currentActivity = null;
  }
}
</script>

<style lang="scss" scoped></style>
