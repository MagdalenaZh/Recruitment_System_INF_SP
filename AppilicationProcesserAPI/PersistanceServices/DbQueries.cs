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

        internal const string GetAllClubsDetails = "SELECT [ClubId], [Information], [AdmissionQuestions] FROM [Clubs]";

        internal const string GetDepartmentsForClub = "SELECT [DepartmentId], [Information], [OpenPositions] FROM [Departments] WHERE [ClubId] = @clubId";
        #endregion

        #region INSERT QUERIES
        internal const string InsertEvent = "INSERT INTO [Events] ([EventId], [AggregateId], [EventType], [PayLoad], [TimeStamp]) VALUES (@eventId, @aggregateId, @eventType, @payload, @timeStamp)";

        internal const string InsertApplication = "INSERT INTO [Applications] ([AggregateId], [UserId], [DepartmentId], [Questionnaire], [Status]) VALUES (@aggregateId, @userId, @departmentId, @questionnaire, @status)";

        internal const string InsertBookedInterviewSlot = "INSERT INTO [BookedSlots] ([SlotId], [AggregateId]) VALUES (@slotId, @aggregateId)";

        internal const string InsertClub = "INSERT INTO [Clubs] ([ClubId], [Information], [AdmissionQuestions]) VALUES (@clubId, @clubName, @admissionQuestions)";

        internal const string InsertDepartment = "INSERT INTO [Departments] ([DepartmentId], [ClubId], [Information], [OpenPositions]) VALUES (@departmentId, @clubId, @departmentName, @openPositions)";

        internal const string InsertInterviewSlot = "INSERT INTO [InterviewSlots] ([SlotId], [ClubId], [StartTime], [EndTime]) VALUES (@slotId, @clubId, @startTime, @endTime)";
        #endregion

        #region UPDATE QUERIES
        internal const string UpdateClubAdmissionQuestions = "UPDATE [Clubs] SET [AdmissionQuestions] = @admissionQuestions WHERE [ClubId] = @clubId";

        internal const string UpdateDepartmentOpenPositions = "UPDATE [Departments] SET [OpenPositions] = @openPositions WHERE [DepartmentId] = @departmentId";

        internal const string UpdateInterviewSlot = "UPDATE [InterviewSlots] SET [StartTime] = @startTime, [EndTime] = @endTime WHERE [SlotId] = @slotId";

        internal const string UpdateUserRole = "UPDATE [Users] SET [RoleId] = @roleId WHERE [UserId] = @userId";
        #endregion
    }
}
