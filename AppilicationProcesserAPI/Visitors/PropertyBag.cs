namespace AppilicationProcesserAPI.Visitors
{
    public sealed class PropertyBag
    {
        private readonly Dictionary<Key, IBox> _values = new();

        public readonly record struct Key(string Name, Type Type);

        private interface IBox
        {
            Type Type { get; }
        }

        private sealed class Box<T> : IBox
        {
            public Box(T value) => Value = value;
            public T Value { get; }
            public Type Type => typeof(T);
        }

        public void Set<T>(string name, T value)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Name is required.", nameof(name));

            _values[new Key(name, typeof(T))] = new Box<T>(value);
        }

        public bool TryGet<T>(string name, out T value)
        {
            if (_values.TryGetValue(new Key(name, typeof(T)), out var box) && box is Box<T> typed)
            {
                value = typed.Value;
                return true;
            }

            value = default!;
            return false;
        }

        public T Get<T>(string name)
        {
            if (TryGet<T>(name, out var value))
                return value;

            throw new KeyNotFoundException($"No value stored for '{name}' with type '{typeof(T).Name}'.");
        }

        public bool Remove<T>(string name) => _values.Remove(new Key(name, typeof(T)));

        public void Clear() => _values.Clear();

        public IEnumerable<Key> Keys => _values.Keys;
    }
}
