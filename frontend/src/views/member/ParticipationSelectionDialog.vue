<template>
    <v-dialog v-model="dialog" persistent width="1300">
      <v-card>
        <v-card-title>
          <span class="headline">
            Participate
          </span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="*Rating"
                  :rules="[
                    (v) =>
                      isRatingValid(v) ||
                      'Rating between 1 and 5 is required',
                  ]"
                  v-model="newParticipation.rating"
                  data-cy="ratingInput"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="$emit('close-participation-dialog')"
          >
            Close
          </v-btn>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="registerParticipation"
            data-cy="registerParticipation"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  <script lang="ts">

  import { Vue, Component, Prop, Model } from 'vue-property-decorator';
  import RemoteServices from '@/services/RemoteServices';
  import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
  import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';
  import { ISOtoString } from '@/services/ConvertDateService';
  import Participation from '@/models/participation/Participation';
  import Enrollment from '@/models/enrollment/Enrollment';
  import Activity from '@/models/activity/Activity';
  
  Vue.component('VueCtkDateTimePicker', VueCtkDateTimePicker);
  @Component({methods: { ISOtoString },})
  export default class ParticipationSelectionDialog extends Vue {
    @Model('dialog', Boolean) dialog!: boolean;
    @Prop({ type: Enrollment, required: true }) readonly enrollment!: Enrollment;
    @Prop({ type: Activity, required: true }) readonly activity!: Activity;
  
    newParticipation: Participation = new Participation();
    cypressCondition: boolean = false;

    async created() {
      this.newParticipation = new Participation();
      this.newParticipation.volunteerId = this.enrollment.volunteerId;
    }
  
    isRatingValid(value: any) {
      if (value === undefined || value === '') return true;
      if (!/^\d+$/.test(value)) return false;
      const parsedValue = parseInt(value);
      return parsedValue >= 1 && parsedValue <= 5;
    }
  
    async registerParticipation() {
      if ((this.$refs.form as Vue & { validate: () => boolean }).validate()) {
        try {
          const result =
            await RemoteServices.registerParticipation(
              this.activity!,
              this.newParticipation,
            );
          this.$emit('save-participation', result);
        } catch (error) {
          await this.$store.dispatch('error', error);
        }
      }
    }
  }
  </script>
  
  <style scoped lang="scss"></style>
  