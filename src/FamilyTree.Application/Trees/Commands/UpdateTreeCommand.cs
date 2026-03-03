using FamilyTree.Domain.Entities;

namespace FamilyTree.Application.Trees.Commands;

/// <summary>
/// Command to update an existing family tree.
/// </summary>
public record UpdateTreeCommand(
    string Id,
    string? Name = null,
    string? Description = null,
    bool? IsPublic = null,
    string? RootPersonId = null,
    TreeLayout? DefaultLayout = null,
    bool? ShowPhotos = null,
    bool? ShowDates = null,
    string? ColorScheme = null,
    double? ZoomLevel = null,
    double? CenterX = null,
    double? CenterY = null
);
