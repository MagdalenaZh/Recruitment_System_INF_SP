using AppilicationProcesserAPI.Security;
using Xunit;

namespace AppilicationProcesserAPI.Tests.Unit;

public class PasswordHasherTests
{
    [Fact]
    public void CreateHash_ProducesNonNullHashAndSalt()
    {
        PasswordHasher.CreateHash("mypassword", out var hash, out var salt);

        Assert.NotNull(hash);
        Assert.NotNull(salt);
    }

    [Fact]
    public void CreateHash_ProducesCorrectLengths()
    {
        PasswordHasher.CreateHash("password123", out var hash, out var salt);

        Assert.Equal(32, hash.Length); // 256-bit hash
        Assert.Equal(16, salt.Length); // 128-bit salt
    }

    [Fact]
    public void Verify_CorrectPassword_ReturnsTrue()
    {
        const string password = "s3cretP@ss";
        PasswordHasher.CreateHash(password, out var hash, out var salt);

        var result = PasswordHasher.Verify(password, hash, salt);

        Assert.True(result);
    }

    [Fact]
    public void Verify_WrongPassword_ReturnsFalse()
    {
        PasswordHasher.CreateHash("correctPassword", out var hash, out var salt);

        var result = PasswordHasher.Verify("wrongPassword", hash, salt);

        Assert.False(result);
    }

    [Fact]
    public void Verify_EmptyPassword_ReturnsFalseForNonEmptyHash()
    {
        PasswordHasher.CreateHash("somePassword", out var hash, out var salt);

        var result = PasswordHasher.Verify("", hash, salt);

        Assert.False(result);
    }

    [Fact]
    public void CreateHash_TwoCalls_ProduceDifferentSalts()
    {
        PasswordHasher.CreateHash("password", out _, out var salt1);
        PasswordHasher.CreateHash("password", out _, out var salt2);

        Assert.False(salt1.SequenceEqual(salt2));
    }

    [Fact]
    public void CreateHash_TwoCalls_SamePassword_ProduceDifferentHashes()
    {
        PasswordHasher.CreateHash("password", out var hash1, out _);
        PasswordHasher.CreateHash("password", out var hash2, out _);

        // Different salts → different hashes (overwhelmingly likely)
        Assert.False(hash1.SequenceEqual(hash2));
    }

    [Fact]
    public void Verify_WrongSalt_ReturnsFalse()
    {
        const string password = "testPass";
        PasswordHasher.CreateHash(password, out var hash, out _);
        PasswordHasher.CreateHash("other", out _, out var wrongSalt);

        var result = PasswordHasher.Verify(password, hash, wrongSalt);

        Assert.False(result);
    }
}
