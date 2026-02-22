using AppilicationProcesserAPI.AggregateStates;

namespace AppilicationProcesserAPI.Representations
{
    public interface IStateRepresentation
    {
        public Guid ApplicationId { get; }
    }

    public class StateRepresentation : IStateRepresentation
    {
        public Guid ApplicationId { get; }

        public IApplicationState State { get; }

        public StateRepresentation(Guid applicationId, IApplicationState applicationState)
        {
            ApplicationId = applicationId;
            State = applicationState;
        }
    }
}
