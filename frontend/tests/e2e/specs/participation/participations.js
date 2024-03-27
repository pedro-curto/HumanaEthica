describe('Participations', () => {
    beforeEach(() => {
        cy.deleteAllButArs();
        cy.createParticipations();
    });

    afterEach(() => {
        cy.deleteAllButArs();
    });

    it('create participations', () => {
        cy.demoMemberLogin();

        // Go to Activities
        cy.intercept('GET', '/users/*/getInstitution').as('getInstitutions');
        cy.get('[data-cy="institution"]').click();
        cy.get('[data-cy="activities"]').click();
        cy.wait('@getInstitutions');

        // Check that the activities table has 2 instances
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .should('have.length', 2)

        // Check that the first activity in the table has one participation
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0)
            .children()
            .eq(5)
            .should('contain', '1')

        // Select ShowEnrollments of the first activity
        cy.intercept('GET', '/activities/*/enrollments').as('showEnrollments');
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0)
            .find('[data-cy="showEnrollments"]')
            .click();
        cy.wait('@showEnrollments');

        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0)
            .children()
            .eq(2)
            .should('contain', 'false')

        // Select enroll in the first activity
        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0)
            .find('[data-cy="selectParticipant"]')
            .click();
        cy.get('[data-cy="ratingInput"]').type(3);
        cy.intercept('POST', '/activities/1/participations').as('registerParticipation');
        cy.get('[data-cy="registerParticipation"]').click();
        cy.wait('@registerParticipation')

        /*
        // Check first enrollment in the participating has been updated to true
        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0)
            .children()
            .eq(2)
            .should('contain','true')
        */

        /*
        // Check that the first activity in the table has 2 participations
        cy.get('[data-cy="getActivities"]').click({force: true});
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0)
            .children()
            .eq(5)
            .should('contain', '2')
        */
        cy.logout();
    });
});