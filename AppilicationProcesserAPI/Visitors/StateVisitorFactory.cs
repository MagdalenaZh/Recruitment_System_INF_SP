namespace AppilicationProcesserAPI.Visitors
{
    public interface IStateVisitorFactory
    {
        IStateVisitor CreateStateVisitor();
    }

    public class StateVisitorFactory : IStateVisitorFactory
    {
        public IStateVisitor CreateStateVisitor()
        {
            return new StateVisitor();
        }
    }
}
