using AppilicationProcesserAPI.Visitors;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

public class PropertyBagTests
{
    [Fact]
    public void Set_And_Get_ReturnsStoredValue()
    {
        var bag = new PropertyBag();

        bag.Set("Count", 3);

        var value = bag.Get<int>("Count");

        Assert.Equal(3, value);
    }

    [Fact]
    public void TryGet_WithWrongType_ReturnsFalse()
    {
        var bag = new PropertyBag();
        bag.Set("Count", 3);

        var found = bag.TryGet<string>("Count", out var value);

        Assert.False(found);
        Assert.Null(value);
    }

    [Fact]
    public void Remove_RemovesOnlyMatchingTypedKey()
    {
        var bag = new PropertyBag();
        bag.Set("Value", 7);
        bag.Set("Value", "seven");

        var removed = bag.Remove<int>("Value");

        Assert.True(removed);
        Assert.Equal("seven", bag.Get<string>("Value"));
        Assert.Throws<KeyNotFoundException>(() => bag.Get<int>("Value"));
    }

    [Fact]
    public void Get_WithoutStoredValue_Throws()
    {
        var bag = new PropertyBag();

        Assert.Throws<KeyNotFoundException>(() => bag.Get<Guid>("Missing"));
    }

    [Fact]
    public void Set_EmptyName_ThrowsArgumentException()
    {
        var bag = new PropertyBag();

        Assert.Throws<ArgumentException>(() => bag.Set("", 42));
        Assert.Throws<ArgumentException>(() => bag.Set("   ", "value"));
    }

    [Fact]
    public void Clear_RemovesAllEntries()
    {
        var bag = new PropertyBag();
        bag.Set("A", 1);
        bag.Set("B", "hello");

        bag.Clear();

        Assert.Throws<KeyNotFoundException>(() => bag.Get<int>("A"));
        Assert.Throws<KeyNotFoundException>(() => bag.Get<string>("B"));
        Assert.Empty(bag.Keys);
    }

    [Fact]
    public void Keys_ReturnsAllStoredKeys()
    {
        var bag = new PropertyBag();
        bag.Set("X", 10);
        bag.Set("Y", "test");

        var keys = bag.Keys.ToList();

        Assert.Equal(2, keys.Count);
    }

    [Fact]
    public void Set_Overwrites_ExistingValueSameType()
    {
        var bag = new PropertyBag();
        bag.Set("Count", 1);
        bag.Set("Count", 99);

        Assert.Equal(99, bag.Get<int>("Count"));
    }

    [Fact]
    public void TryGet_MissingKey_ReturnsFalseAndDefault()
    {
        var bag = new PropertyBag();

        var found = bag.TryGet<int>("missing", out var value);

        Assert.False(found);
        Assert.Equal(0, value);
    }

    [Fact]
    public void Remove_NonExistentKey_ReturnsFalse()
    {
        var bag = new PropertyBag();

        var removed = bag.Remove<int>("DoesNotExist");

        Assert.False(removed);
    }
}
