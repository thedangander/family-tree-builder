using FamilyTree.Domain.Entities;

namespace FamilyTree.Application.DTOs;

public record PersonDto
{
    public string Id { get; init; } = string.Empty;
    public string TreeId { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? MaidenName { get; init; }
    public Gender Gender { get; init; }
    public DateTime? DateOfBirth { get; init; }
    public DateTime? DateOfDeath { get; init; }
    public string? PlaceOfBirth { get; init; }
    public string? PlaceOfDeath { get; init; }
    public string? Biography { get; init; }
    public string? PhotoUrl { get; init; }
    public string? Occupation { get; init; }
    public string? Email { get; init; }
    public string? Phone { get; init; }
    public AddressDto? Address { get; init; }
    public double PositionX { get; init; }
    public double PositionY { get; init; }
    public string FullName { get; init; } = string.Empty;
    public bool IsAlive { get; init; }
    public int? Age { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record AddressDto
{
    public string? Street { get; init; }
    public string? City { get; init; }
    public string? State { get; init; }
    public string? Country { get; init; }
    public string? PostalCode { get; init; }
}

public static class PersonMappingExtensions
{
    public static PersonDto ToDto(this Person person) => new()
    {
        Id = person.Id,
        TreeId = person.TreeId,
        FirstName = person.FirstName,
        LastName = person.LastName,
        MaidenName = person.MaidenName,
        Gender = person.Gender,
        DateOfBirth = person.DateOfBirth,
        DateOfDeath = person.DateOfDeath,
        PlaceOfBirth = person.PlaceOfBirth,
        PlaceOfDeath = person.PlaceOfDeath,
        Biography = person.Biography,
        PhotoUrl = person.PhotoUrl,
        Occupation = person.Occupation,
        Email = person.Email,
        Phone = person.Phone,
        Address = person.Address?.ToDto(),
        PositionX = person.PositionX,
        PositionY = person.PositionY,
        FullName = person.FullName,
        IsAlive = person.IsAlive,
        Age = person.Age,
        CreatedAt = person.CreatedAt,
        UpdatedAt = person.UpdatedAt
    };

    public static AddressDto ToDto(this Address address) => new()
    {
        Street = address.Street,
        City = address.City,
        State = address.State,
        Country = address.Country,
        PostalCode = address.PostalCode
    };
}
