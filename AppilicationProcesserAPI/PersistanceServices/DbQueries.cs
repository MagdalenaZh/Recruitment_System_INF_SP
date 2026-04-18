namespace AppilicationProcesserAPI.PersistanceServices
{
    internal static class DbQueries
    {
        #region SELECT QUERIES
        internal const string GetAllEventsForAggregate = "SELECT [EventType], [PayLoad] FROM [Events] WHERE [AggregateId] = @aggregateId ORDER BY [TimeStamp]";
        internal const string GetAllApplicationsForUser = "SELECT [AggregateId], [DepartmentId], [Questionnaire], [Status] FROM [Applications] WHERE [UserId] = @userId";
        internal const string GetAllApplicationsForClub = """
            SELECT appl.[AggregateId], appl.[UserId], appl.[DepartmentId], appl.[Questionnaire], appl.[Status] 
            FROM [Applications] AS appl 
            INNER JOIN [Departments] AS deprt ON appl.[DepartmentId] = deprt.[DepartmentId] 
            INNER JOIN [Clubs] AS clb ON deprt.[ClubId] = clb.[ClubId] 
            WHERE clb.[ClubId] = @clubId
            """;
        internal const string GetAllApplicationsForDepartment = """
            SELECT [AggregateId], [UserId], [Questionnaire], [Status] 
            FROM [Applications] WHERE [DepartmentId] = @departmentId
            """;
        internal const string GetAllOpenInterviewSlotsForClub = """
            SELECT s.[SlotId], s.[StartTime], s.[EndTime]
            FROM [InterviewSlots] AS s 
            WHERE s.ClubId = @clubId
              AND NOT EXISTS
              (
                  SELECT 1
                  FROM BookedSlots AS b
                  WHERE b.SlotId = s.SlotId
              )
            ORDER BY s.StartTime
            """;

        internal const string GetAllBookedInterviewSlotsForClub = """
            SELECT b.[AggregateId], s.[StartTime], s.[EndTime] 
            FROM [BookedSlots] AS b 
            INNER JOIN [InterviewSlots] AS s ON b.SlotId = s.SlotId 
            WHERE s.[ClubId] = @clubId
            ORDER BY s.StartTime
            """;

        internal const string GetAllClubsDetails = "SELECT [ClubId], [ClubName], [ApplicationQuestions], [Description], [Category] FROM [Clubs]";

        internal const string GetDepartmentsForClub = "SELECT [DepartmentId], [DepartmentName], [OpenPositions], [Description] FROM [Departments] WHERE [ClubId] = @clubId";

        internal const string GetRequiredApprovalsForDepartment = """
            SELECT cb.[RequiredApprovals] 
            FROM [Clubs] AS cb 
            INNER JOIN [Departments] AS deprt 
            ON deprt.[ClubId] = cb.[ClubId] 
            WHERE deprt.[DepartmentId] = @departmentId
            """;

        internal const string GetDepartmentIdForApplication = "SELECT [DepartmentId], [UserId] FROM [Applications] WHERE [AggregateId] = @aggregateId";

        internal const string GetUserInformation = """
            SELECT u.[UserId], u.[FirstName], u.[LastName], uc.[Email], u.[AcademicYear], u.[StudyMajor], u.[CVContent]
            FROM [Users] AS u
            INNER JOIN [UserCredentials] AS uc ON uc.[UserId] = u.[UserId]
            WHERE u.[UserId] = @userId
            """;

        internal const string GetUserRights = """
            SELECT r.[Name], u.[AdminClubId], u.[DepartmentId] 
            FROM [Users] AS u 
            INNER JOIN [Roles] AS r ON u.[RoleId] = r.[RoleId] 
            WHERE u.[UserId] = @userId
            """;

        internal const string GetAllNotesForApplication = """
            SELECT nt.[NoteId], nt.[UserId], nt.[Payload], usr.[FirstName], usr.[LastName]
            FROM [Notes] AS nt
            INNER JOIN [Users] AS usr ON usr.[UserId] = nt.[UserId]
            WHERE nt.[ApplicationId] = @applicationId
            ORDER BY nt.[Id] ASC
            """;

        internal const string GetAllRoles = "SELECT [RoleId], [Name] FROM [Roles]";
        #endregion

        #region INSERT QUERIES
        internal const string InsertEvent = "INSERT INTO [Events] ([EventId], [AggregateId], [EventType], [PayLoad], [TimeStamp]) VALUES (@eventId, @aggregateId, @eventType, @payload, @timeStamp)";

        internal const string InsertApplication = "INSERT INTO [Applications] ([AggregateId], [UserId], [DepartmentId], [Questionnaire], [Status]) VALUES (@aggregateId, @userId, @departmentId, @questionnaire, @status)";

        internal const string InsertBookedInterviewSlot = "INSERT INTO [BookedSlots] ([SlotId], [AggregateId]) VALUES (@slotId, @aggregateId)";

        internal const string InsertClub = "INSERT INTO [Clubs] ([ClubId], [ClubName], [ApplicationQuestions], [Description], [RequiredApprovals], [Category]) VALUES (@clubId, @clubName, @applicationQuestions, @description, @requiredApprovals, @category)";

        internal const string InsertDepartment = "INSERT INTO [Departments] ([DepartmentId], [ClubId], [DepartmentName], [OpenPositions], [Description]) VALUES (@departmentId, @clubId, @departmentName, @openPositions, @description)";

        internal const string InsertInterviewSlot = "INSERT INTO [InterviewSlots] ([SlotId], [ClubId], [StartTime], [EndTime]) VALUES (@slotId, @clubId, @startTime, @endTime)";

        internal const string InsertNote = "INSERT INTO [Notes] ([NoteId], [ApplicationId], [UserId], [Payload]) VALUES (@noteId, @applicationId, @userId, @payload)";
        #endregion

        #region UPDATE QUERIES
        internal const string UpdateClubAdmissionQuestions = "UPDATE [Clubs] SET [ClubName] = @clubName, [ApplicationQuestions] = @applicationQuestions, [RequiredApprovals] = @requiredApprovals, [Description] = @description, [Category] = @category WHERE [ClubId] = @clubId";

        internal const string UpdateDepartmentOpenPositions = "UPDATE [Departments] SET [DepartmentName] = @departmentName, [Description] = @description, [OpenPositions] = @openPositions WHERE [DepartmentId] = @departmentId";

        internal const string UpdateInterviewSlot = "UPDATE [InterviewSlots] SET [StartTime] = @startTime, [EndTime] = @endTime WHERE [SlotId] = @slotId";

        internal const string UpdateUserRole = "UPDATE [Users] SET [RoleId] = @roleId WHERE [UserId] = @userId";

        internal const string UpdateDemoteClubAdminToUser = "UPDATE [Users] SET [AdminClubId] = NULL, [RoleId] = @roleId WHERE [AdminClubId] = @clubId";

        internal const string UpdatePromoteUserToClubAdmin = "UPDATE [Users] SET [AdminClubId] = @clubId, [RoleId] = @roleId WHERE [UserId] = @userId";

        internal const string UpdateAssignClubAdmin = "UPDATE [Users] SET [AdminClubId] = @clubId, [DepartmentId] = NULL, [RoleId] = @roleId WHERE [UserId] = @userId";

        internal const string UpdateAssignBoardMember = "UPDATE [Users] SET [DepartmentId] = @departmentId, [AdminClubId] = NULL, [RoleId] = @roleId WHERE [UserId] = @userId";

        internal const string UpdateApplicationStatus = "UPDATE [Applications] SET [Status] = @status WHERE [AggregateId] = @aggregateId";

        internal const string UpdateUserDepartment = "UPDATE [Users] SET [DepartmentId] = @departmentId WHERE [UserId] = @userId";

        internal const string UpdateNote = "UPDATE [Notes] SET [Payload] = @payload WHERE [NoteId] = @noteId";

        internal const string UpdateUserInformation = "UPDATE [Users] SET [FirstName] = @firstName, [LastName] = @lastName, [AcademicYear] = @academicYear, [StudyMajor] = @studyMajor, [CVContent] = @cvContent WHERE [UserId] = @userId";
        #endregion
    }
}
