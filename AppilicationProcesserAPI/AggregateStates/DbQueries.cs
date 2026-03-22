namespace AppilicationProcesserAPI.AggregateStates
{
    internal static class DbQueries
    {
        #region SELECT QUERIES
        internal const string GetAllEventsForAggregate = "SELECT [EventType], [PayLoad] FROM [Events] WHERE [AggregateId] = @aggregateId ORDER BY [TimeStamp]";
        internal const string GetAllApplicationsForUser = "SELECT [AggregateId] FROM [Applications] WHERE [UserId] = @userId";
        internal const string GetAllApplicationsForClub = """
            SELECT appl.[AggregateId] 
            FROM [Applications] AS appl 
            INNER JOIN [Departments] AS deprt ON appl.[DepartmentId] = deprt.[DepartmentId] 
            INNER JOIN [Clubs] AS clb ON deprt.[ClubId] = clb.[ClubId]
            WHERE clb.[ClubId] = @clubId
            """;
        #endregion

        #region INSERT QUERIES
        internal const string InsertEvent = "INSERT INTO [Events] ([EventId], [AggregateId], [EventType], [PayLoad], [TimeStamp]) VALUES (@eventId, @aggregateId, @eventType, @payload, @timeStamp)";
        internal const string InsertApplication = "INSERT INTO [Applications] ([AggregateId], [UserId], [DepartmentId], [Questionnaire] [Status]) VALUES (@aggregateId, @userId, @departmentId, @questionnaire, @status)";
        #endregion
    }
}
