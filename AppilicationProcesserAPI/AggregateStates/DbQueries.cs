namespace AppilicationProcesserAPI.AggregateStates
{
    internal static class DbQueries
    {
        #region SELECT QUERIES
        internal const string GetAllEventsForAggregate = "SELECT [EventType], [PayLoad] FROM [Events] WHERE [AggregateId] = @aggregateId ORDER BY [TimeStamp]";
        internal const string GetAllApplicationsForUser = "SELECT [AggregateId] FROM [Applications] WHERE [UserId] = @userId";
        #endregion

        #region INSERT QUERIES
        internal const string InsertEvent = "INSERT INTO [Events] ([EventId], [AggregateId], [EventType], [PayLoad], [TimeStamp]) VALUES (@eventId, @aggregateId, @eventType, @payload, @timeStamp)";
        internal const string InsertApplication = "INSERT INTO [Applications] ([AggregateId], [UserId], [DepartmentId], [Questionnaire] [Status]) VALUES (@aggregateId, @userId, @departmentId, @questionnaire, @status)";
        #endregion
    }
}
