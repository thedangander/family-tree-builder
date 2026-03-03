using FluentAssertions;
using FamilyTree.Domain.Entities;

namespace FamilyTree.Domain.Tests.Entities;

public class PersonTests
{
    [Fact]
    public void Person_ShouldBeCreatedWithDefaultValues()
    {
        // Arrange & Act
        var person = new Person();

        // Assert
        person.Id.Should().BeNull();
        person.TreeId.Should().BeNull();
        person.FirstName.Should().BeNull();
        person.LastName.Should().BeNull();
        person.MiddleName.Should().BeNull();
        person.Gender.Should().BeNull();
        person.BirthDate.Should().BeNull();
        person.DeathDate.Should().BeNull();
        person.BirthPlace.Should().BeNull();
        person.DeathPlace.Should().BeNull();
        person.Notes.Should().BeNull();
        person.PhotoUrl.Should().BeNull();
        person.PositionX.Should().Be(0);
        person.PositionY.Should().Be(0);
    }

    [Fact]
    public void Person_ShouldAcceptValidValues()
    {
        // Arrange
        var id = "person123";
        var treeId = "tree456";
        var firstName = "John";
        var lastName = "Doe";
        var middleName = "William";
        var gender = "Male";
        var birthDate = new DateTime(1980, 5, 15);
        var birthPlace = "New York, NY";
        var notes = "Test notes";
        var photoUrl = "https://example.com/photo.jpg";
        var positionX = 100.0;
        var positionY = 200.0;

        // Act
        var person = new Person
        {
            Id = id,
            TreeId = treeId,
            FirstName = firstName,
            LastName = lastName,
            MiddleName = middleName,
            Gender = gender,
            BirthDate = birthDate,
            BirthPlace = birthPlace,
            Notes = notes,
            PhotoUrl = photoUrl,
            PositionX = positionX,
            PositionY = positionY
        };

        // Assert
        person.Id.Should().Be(id);
        person.TreeId.Should().Be(treeId);
        person.FirstName.Should().Be(firstName);
        person.LastName.Should().Be(lastName);
        person.MiddleName.Should().Be(middleName);
        person.Gender.Should().Be(gender);
        person.BirthDate.Should().Be(birthDate);
        person.BirthPlace.Should().Be(birthPlace);
        person.Notes.Should().Be(notes);
        person.PhotoUrl.Should().Be(photoUrl);
        person.PositionX.Should().Be(positionX);
        person.PositionY.Should().Be(positionY);
    }

    [Fact]
    public void Person_WithDeathDate_ShouldBeValid()
    {
        // Arrange
        var birthDate = new DateTime(1950, 1, 1);
        var deathDate = new DateTime(2020, 12, 31);
        var deathPlace = "Los Angeles, CA";

        // Act
        var person = new Person
        {
            FirstName = "Jane",
            LastName = "Doe",
            BirthDate = birthDate,
            DeathDate = deathDate,
            DeathPlace = deathPlace
        };

        // Assert
        person.DeathDate.Should().Be(deathDate);
        person.DeathPlace.Should().Be(deathPlace);
        person.DeathDate.Should().BeAfter(person.BirthDate!.Value);
    }

    [Fact]
    public void Person_PositionCoordinates_ShouldSupportNegativeValues()
    {
        // Arrange & Act
        var person = new Person
        {
            PositionX = -150.5,
            PositionY = -250.75
        };

        // Assert
        person.PositionX.Should().Be(-150.5);
        person.PositionY.Should().Be(-250.75);
    }
}
