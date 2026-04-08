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
}
