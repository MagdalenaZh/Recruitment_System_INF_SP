using AppilicationProcesserAPI.AggregateStates;
using AppilicationProcesserAPI.Data;
using AppilicationProcesserAPI.DomainEvents;
using AppilicationProcesserAPI.Representations;

namespace AppilicationProcesserAPI.Visitors
{
    public interface IStateVisitor
    {
        public PropertyBag PropertyBag { get; }

        public void Visit(InitialApplicationState initialState);

        public void Visit(ProcessingApplicationState processingState);

        public void Visit(HibernatedApplicationState hibernatedState);

        public void Visit(ApplicationApprovedState approvedState);

        public void Visit(ApplicationConcludedState concludedState);

        public IStateRepresentation GetStateRepresentation();
    }

    public class StateVisitor : IStateVisitor
    {
        public PropertyBag PropertyBag { get; }

        private IStateRepresentation? _stateRepresentation;

        public StateVisitor()
        {
            PropertyBag = new PropertyBag();
        }

        public IStateRepresentation GetStateRepresentation()
        {
            if (_stateRepresentation == null)
            {
                throw new InvalidOperationException("State representation has not been set. Ensure that a state has been visited before calling this method.");
            }
            return _stateRepresentation;
        }

        public void Visit(InitialApplicationState initialState)
        {
            _stateRepresentation = new InitialRepresentation
            {
                ApplicationId = PropertyBag.Get<Guid>("ApplicationId"),
                ApplicationProcessed = PropertyBag.Get<bool>("ApplicationProcessed")
            };
        }

        public void Visit(ProcessingApplicationState processingState)
        {
            _stateRepresentation = new ProcessingStateRepresentation
            {
                ApplicationId = PropertyBag.Get<Guid>("ApplicationId"),
                CurrentNumberOfApprovals = PropertyBag.Get<int>("CurrentNumberOfApprovals"),
                RequiredNumberOfApprovals = PropertyBag.Get<int>("RequiredNumberOfApprovals"),
                UserDecisionsMap = PropertyBag.Get<Dictionary<Guid, bool>>("UserDecisionsMap")
            };
        }

        public void Visit(HibernatedApplicationState hibernatedState)
        {
            _stateRepresentation = new HibernatedStateRepresentation
            {
                ApplicationId = PropertyBag.Get<Guid>("ApplicationId"),
                ScheduledTime = PropertyBag.Get<InterviewSlot>("ScheduledTime")
            };
        }

        public void Visit(ApplicationApprovedState approvedState)
        {
            _stateRepresentation = new ApprovedStateRepresentation
            {
                ApplicationId = PropertyBag.Get<Guid>("ApplicationId")
            };
        }

        public void Visit(ApplicationConcludedState concludedState)
        {
            _stateRepresentation = new ConcludedStateRepresentation
            {
                ApplicationId = PropertyBag.Get<Guid>("ApplicationId"),
                ConclusionResult = PropertyBag.Get<ApplicationStatus>("ConclusionResult")
            };
        }
    }
}
