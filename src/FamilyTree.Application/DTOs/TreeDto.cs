using FamilyTree.Domain.Entities;

namespace FamilyTree.Application.DTOs;

public record TreeDto
{
    public string Id { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string OwnerId { get; init; } = string.Empty;
    public bool IsPublic { get; init; }
    public List<TreeShareDto> SharedWith { get; init; } = new();
    public TreeSettingsDto Settings { get; init; } = new();
    public string? RootPersonId { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public record TreeShareDto
{
    public string UserId { get; init; } = string.Empty;
    public TreePermission Permission { get; init; }
    public DateTime SharedAt { get; init; }
}

public record TreeSettingsDto
{
    public TreeLayout DefaultLayout { get; init; } = TreeLayout.Hierarchical;
    public bool ShowPhotos { get; init; } = true;
    public bool ShowDates { get; init; } = true;
    public string ColorScheme { get; init; } = "default";
    public double ZoomLevel { get; init; } = 1.0;
    public double CenterX { get; init; }
    public double CenterY { get; init; }
}

public static class TreeMappingExtensions
{
    public static TreeDto ToDto(this Tree tree) => new()
    {
        Id = tree.Id,
        Name = tree.Name,
        Description = tree.Description,
        OwnerId = tree.OwnerId,
        IsPublic = tree.IsPublic,
        SharedWith = tree.SharedWith.Select(s => s.ToDto()).ToList(),
        Settings = tree.Settings.ToDto(),
        RootPersonId = tree.RootPersonId,
        CreatedAt = tree.CreatedAt,
        UpdatedAt = tree.UpdatedAt
    };

    public static TreeShareDto ToDto(this TreeShare share) => new()
    {
        UserId = share.UserId,
        Permission = share.Permission,
        SharedAt = share.SharedAt
    };

    public static TreeSettingsDto ToDto(this TreeSettings settings) => new()
    {
        DefaultLayout = settings.DefaultLayout,
        ShowPhotos = settings.ShowPhotos,
        ShowDates = settings.ShowDates,
        ColorScheme = settings.ColorScheme,
        ZoomLevel = settings.ZoomLevel,
        CenterX = settings.CenterX,
        CenterY = settings.CenterY
    };
}
