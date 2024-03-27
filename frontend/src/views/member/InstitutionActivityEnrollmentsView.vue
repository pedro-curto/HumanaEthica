<template>
  <v-card class="table">
    <div class="text-h3">{{ activity.name }}</div>
    <v-data-table
      :headers="headers"
      :items="enrollments"
      :search="search"
      disable-pagination
      :hide-default-footer="true"
      :mobile-breakpoint="0"
      data-cy="activityEnrollmentsTable"
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
          <v-btn
            color="primary"
            dark
            @click="getActivities"
            data-cy="getActivities"
            >Activities</v-btn
          >
        </v-card-title>
      </template>
      <template v-slot:[`item.participating`]="{ item }">
          <div v-if="isParticipating(item)" bottom>
            <span>true</span>
          </div>
          <div v-else bottom>
            <span>false</span>
          </div>
      </template>
      <template v-slot:[`item.action`]="{ item }">
        <v-tooltip v-if="!isParticipating(item) && !isActivityFull()" bottom>
          <template v-slot:activator="{ on }">
            <v-icon
              class="mr-2 action-button"
              @click="newParticipation(item)"
              v-on="on"
              data-cy="selectParticipant"
              >fa-solid fa-check
            </v-icon>
          </template>
          <span>Select Participant</span>
        </v-tooltip>
      </template>
    </v-data-table>
    <participation-dialog
      v-if="currentEnrollment && editParticipationDialog"
      v-model="editParticipationDialog"
      :enrollment="currentEnrollment"
      :activity="activity"
      v-on:save-participation="onSaveParticipation"
      v-on:close-participation-dialog="onCloseParticipationDialog"
    />
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import RemoteServices from '@/services/RemoteServices';
import Activity from '@/models/activity/Activity';
import Enrollment from '@/models/enrollment/Enrollment';
import Participation from '@/models/participation/Participation';
import ParticipationSelectionDialog from '@/views/member/ParticipationSelectionDialog.vue';

@Component({
  components: {
    'participation-dialog': ParticipationSelectionDialog,
  },
})
export default class InstitutionActivityEnrollmentsView extends Vue {
  activity!: Activity;
  enrollments: Enrollment[] = [];
  participants: Participation[] = [];
  search: string = '';

  currentEnrollment: Enrollment | null = null;
  editParticipationDialog: boolean = false;

  headers: object = [
    {
      text: 'Motivation',
      value: 'motivation',
      align: 'left',
      width: '30%',
    },
    {
      text: 'Volunteer Name',
      value: 'volunteerName',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Participating',
      value: 'participating',
      align: 'left',
      width: '5%',
    },
    {
      text: 'Application Date',
      value: 'enrollmentDateTime',
      align: 'left',
      width: '10%',
    },
    {
      text: 'Action',
      value: 'action',
      align: 'left',
      width: '5%',
    }
  ];

  async created() {
    this.activity = this.$store.getters.getActivity;
    if (this.activity !== null && this.activity.id !== null) {
      await this.$store.dispatch('loading');
      try {
        this.enrollments = await RemoteServices.getActivityEnrollments(
          this.activity.id,
        );
        this.participants = await RemoteServices.getActivityParticipants(
          this.activity.id,
        );
      } catch (error) {
        await this.$store.dispatch('error', error);
      }
      await this.$store.dispatch('clearLoading');
    }
  }

  async getActivities() {
    await this.$store.dispatch('setActivity', null);
    this.$router.push({ name: 'institution-activities' }).catch(() => {});
  }
  
  isParticipating(enrollment: Enrollment) {
    return this.participants.some(
      (participation) => participation.volunteerId === enrollment.volunteerId,
    );
  }

  isActivityFull() {
    return this.participants.length >= this.activity.participantsNumberLimit;
  }

  newParticipation(enrollment: Enrollment) {
    this.currentEnrollment = enrollment
    this.editParticipationDialog = true;
  }

  onCloseParticipationDialog() {
    this.currentEnrollment = null;
    this.editParticipationDialog = false;
  }

  async onSaveParticipation(participation: Participation) {
    this.participants.unshift(participation);
    this.editParticipationDialog = false;
    this.currentEnrollment = null;
  }

}
</script>

<style lang="scss" scoped>
.date-fields-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.date-fields-row {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}
</style>