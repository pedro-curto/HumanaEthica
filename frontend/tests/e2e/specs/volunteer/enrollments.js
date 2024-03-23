describe('Enrollment', () => {
    beforeEach(() => {
        cy.deleteAllButArs();
        cy.createEnrollmentEntities();
    });

    afterEach(() => {
        cy.deleteAllButArs();
    });

    it('apply to the first activity', () => {
        const MOTIVATION = 'I would like to participate in this activity because I love to spend time with the elderly.';
        // ------------ VOLUNTEER TEST ------------
        cy.demoVolunteerLogin()

        // intercept get activities request
        cy.intercept('GET', '/activities').as('getActivities');
        // go to volunteer activities view
        cy.get('[data-cy="volunteerActivities"]').click();
        // check request was done
        cy.wait('@getActivities');
        // select the first activity
        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
            .eq(0).children().eq(0).click();
        // intercept post apply to activity request
        cy.intercept('POST', '/activities/*/apply').as('applyToActivity');
        // click on apply button
        cy.get('[data-cy="applyButton"]').click();
        // check if the enrollment dialog is visible
        cy.get('[data-cy="enrollmentDialog"]').should('be.visible');
        // fill motivation input
        cy.get('[data-cy="motivationInput"]').type(MOTIVATION);
        // save
        cy.get('[data-cy="saveEnrollment"]').click();
        // check if the application was successful
        cy.wait('@applyToActivity');
        // verify that the apply button does not exist anymore
        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
            .eq(0).find('[data-cy="applyButton"]').should('not.exist');
        cy.logout();
    });
});