using AppilicationProcesserAPI.MessageQueue;
using AppilicationProcesserAPI.Representations;
using AppilicationProcesserAPI.Visitors;
using System.Threading.Channels;

namespace AppilicationProcesserAPI.AggregateStates
{
    public interface IApplicationStatusManager
    {
        ValueTask UpdateApplicationStatus(IStateRepresentation representation, CancellationToken cancellationToken);

        ValueTask<StatusUpdateEnvelope> GetApplicationStatus(CancellationToken cancellationToken);
    }

    public class ApplicationStatusManager : IApplicationStatusManager
    {
        private readonly Channel<StatusUpdateEnvelope> _queue;
        private readonly ILogger<ApplicationStatusManager> _logger;

        public ApplicationStatusManager(ILogger<ApplicationStatusManager> logger)
        {
            _queue = Channel.CreateUnbounded<StatusUpdateEnvelope>();
            _logger = logger;
        }

        public async ValueTask<StatusUpdateEnvelope> GetApplicationStatus(CancellationToken cancellationToken)
        {
            return await _queue.Reader.ReadAsync(cancellationToken) is StatusUpdateEnvelope message
                 ? message
                 : throw new InvalidOperationException($"Expected message of type {typeof(EventEnvelope).Name} but received a different type.");
        }

        public async ValueTask UpdateApplicationStatus(IStateRepresentation representation, CancellationToken cancellationToken)
        {
            if (representation == null) throw new ArgumentNullException(nameof(representation));

            var statusUpdate = ConvertToStatusUpdateRepresentation(representation);

            if (statusUpdate is null) return;

            var message = new StatusUpdateEnvelope(statusUpdate);

            await _queue.Writer.WriteAsync(message, cancellationToken);

            return;
        }

        private static IStatusRepresentation? ConvertToStatusUpdateRepresentation(IStateRepresentation representation)
        {
            if (representation is null) throw new ArgumentNullException(nameof(representation));

            switch (representation)
            {
                case InitialRepresentation:
                    return new InProgressStatusRepresentation(representation.ApplicationId);
                case HibernatedStateRepresentation:
                    return new PendingInterviewStatusRepresentation(representation.ApplicationId);
                case ConcludedStateRepresentation concludedStateRepresentation:
                    return new ConcludedStatusRepresentation(concludedStateRepresentation.ApplicationId, concludedStateRepresentation.ConclusionResult);
                default: return null;
            }
        }
    }
}
