describe('Enrollment', () => {
    beforeEach(() => {
        cy.deleteAllButArs();
        cy.createEnrollmentEntities();
    });

    afterEach(() => {
        cy.deleteAllButArs();
    });

    it('create enrollment', () => {
        // ------------ MEMBER TEST (PART 1): Check Activity Table ------------
        cy.demoMemberLogin();

        // intercept get institutions
        cy.intercept('GET', '/users/*/getInstitution').as('getInstitutions');

        cy.get('[data-cy="institution"]').click();
        cy.get('[data-cy="activities"]').click();
        cy.wait('@getInstitutions');

        // check that the activities table has 3 rows
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .should('have.length', 3)
            .eq(0)
            .children()
            .should('have.length', 13)

        // check that the first activity has 0 applications
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0)
            .children()
            .eq(10)
            .should('contain', 0);
        cy.logout();
        
        // ------------ VOLUNTEER TEST: apply to the first activity ------------
        const MOTIVATION = 'I would like to participate in this activity because I love to spend time with the elderly.';
        cy.demoVolunteerLogin()

        // intercept create enrollment request and inject date values in the request body
        cy.intercept('POST', '/activities/*/enrollments', (req) => {
          req.body = {
            motivation: MOTIVATION,
          };
        }).as('createEnrollment');
        // intercept get activities request
        cy.intercept('GET', '/activities').as('getActivities');
        // go to volunteer activities view
        cy.get('[data-cy="volunteerActivities"]').click();
        // check request was done
        cy.wait('@getActivities');
        // select the first activity
        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
            .should('have.length', 3)
            .eq(0)
            .children()
            .should('have.length', 10)
        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
            .eq(0)
            .find('[data-cy="applyButton"]')
            .click();
        // fill motivation input
        cy.get('[data-cy="motivationInput"]').type(MOTIVATION);
        // save
        cy.get('[data-cy="saveEnrollment"]').click();
        // check if the application was successful
        cy.wait('@createEnrollment')
        // verify that the apply button does not exist anymore
        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
            .eq(0)
            .find('[data-cy="applyButton"]')
            .should('not.exist');
        cy.logout();
    
        // ------------ MEMBER TEST (PART 2): Check Activity Table again ------------
        cy.demoMemberLogin();

        // intercept get institutions request
        cy.intercept('GET', '/users/*/getInstitution').as('getInstitutions');
        // go to institution activities view
        cy.get('[data-cy="institution"]').click();
        cy.get('[data-cy="activities"]').click();
        // check request was done
        cy.wait('@getInstitutions');

        // check that the first activity has 1 application1
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(1)
            .children()
            .eq(10)
            .should('contain', 1);
        
        // intercept get activity enrollments request
        cy.intercept('GET', '/activities/*/enrollments').as('showEnrollments');
        // check the activtiy's enrollment table
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0)
            .find('[data-cy="showEnrollments"]')
            .click();
            // check request was done
        cy.wait('@showEnrollments');
        // check if the table has one entry
        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .should('have.length', 1)
            .eq(0)
            .children()
            .should('have.length', 5);
        // check if that entry has the expected motivation
        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0)
            .children()
            .eq(0)
            .should('contain', MOTIVATION)
        cy.logout();
    });
});