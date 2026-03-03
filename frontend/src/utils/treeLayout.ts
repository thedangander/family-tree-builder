import { Node, Edge } from 'reactflow';
import { Person, Relationship, RelationshipType } from '../types';

const NODE_WIDTH = 220;
const HORIZONTAL_SPACING = 300;
const VERTICAL_SPACING = 200;
const SPOUSE_GAP = 100;

interface LayoutNode {
  id: string;
  person: Person;
  generation: number;
  x: number;
  children: string[];
  parents: string[];
  spouses: string[];
}

export function areInverseRelationships(type1: RelationshipType, type2: RelationshipType): boolean {
  if (type1 === RelationshipType.PARENT && type2 === RelationshipType.PARENT) return true;
  if (type1 === RelationshipType.SPOUSE && type2 === RelationshipType.SPOUSE) return true;
  return false;
}

export function getRelationshipCategory(type: RelationshipType): 'vertical' | 'horizontal' {
  return type === RelationshipType.PARENT ? 'vertical' : 'horizontal';
}

export function buildFamilyTreeLayout(
  persons: Person[],
  relationships: Relationship[]
): { nodes: Node[]; edges: Edge[] } {
  if (persons.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Build graph
  const nodes = new Map<string, LayoutNode>();
  persons.forEach((p) => {
    nodes.set(p.id, {
      id: p.id,
      person: p,
      generation: -1,
      x: 0,
      children: [],
      parents: [],
      spouses: [],
    });
  });

  relationships.forEach((rel) => {
    const from = nodes.get(rel.fromPersonId);
    const to = nodes.get(rel.toPersonId);
    if (!from || !to) return;

    if (rel.relationshipType === RelationshipType.PARENT) {
      // Check for circular reference: if 'to' is already a parent of 'from', skip
      if (from.parents.includes(to.id)) {
        console.warn(`Circular parent reference detected: ${from.person.firstName} <-> ${to.person.firstName}. Skipping.`);
        return;
      }
      if (!from.children.includes(to.id)) from.children.push(to.id);
      if (!to.parents.includes(from.id)) to.parents.push(from.id);
    } else if (rel.relationshipType === RelationshipType.SPOUSE) {
      if (!from.spouses.includes(to.id)) from.spouses.push(to.id);
      if (!to.spouses.includes(from.id)) to.spouses.push(from.id);
    }
  });

  // STEP 1: Find TRUE roots - people who:
  // - Have no parents
  // - Have children
  // - Their spouse (if any) also has no parents
  // This prevents marking "married-in" spouses as roots
  const trueRoots = Array.from(nodes.values()).filter((n) => {
    if (n.parents.length > 0) return false; // Has parents, not a root
    if (n.children.length === 0) return false; // No children, not a root

    // Check if this person has a spouse who HAS parents
    // If so, this person is "married-in" and should inherit spouse's generation
    const spouseHasParents = n.spouses.some((sid) => {
      const spouse = nodes.get(sid);
      return spouse && spouse.parents.length > 0;
    });

    return !spouseHasParents; // Only a true root if no spouse has parents
  });

  console.log('True roots:', trueRoots.map(r => r.person.firstName));

  if (trueRoots.length > 0) {
    trueRoots.forEach((r) => (r.generation = 0));
  } else {
    // Fallback: first person with no parents, or just first person
    const anyRoot = Array.from(nodes.values()).find((n) => n.parents.length === 0);
    if (anyRoot) {
      anyRoot.generation = 0;
    } else {
      nodes.get(persons[0].id)!.generation = 0;
    }
  }

  // STEP 2: Propagate generations through parent-child relationships
  // Use iteration limit to prevent infinite loops from circular references
  let changed = true;
  let iterations = 0;
  const maxIterations = persons.length * 10; // Safety limit
  
  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    nodes.forEach((node) => {
      if (node.generation === -1) return;

      // Children = generation + 1
      node.children.forEach((cid) => {
        const child = nodes.get(cid)!;
        if (child.generation === -1) {
          child.generation = node.generation + 1;
          changed = true;
        }
      });

      // Parents = generation - 1
      node.parents.forEach((pid) => {
        const parent = nodes.get(pid)!;
        if (parent.generation === -1) {
          parent.generation = node.generation - 1;
          changed = true;
        }
      });
    });
  }
  
  if (iterations >= maxIterations) {
    console.warn('Layout: Max iterations reached during generation propagation - possible circular reference detected');
  }

  // STEP 3: Propagate to spouses
  changed = true;
  iterations = 0;
  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    nodes.forEach((node) => {
      if (node.generation === -1) return;

      node.spouses.forEach((sid) => {
        const spouse = nodes.get(sid)!;
        if (spouse.generation === -1) {
          spouse.generation = node.generation;
          changed = true;
        }
      });
    });
  }

  // STEP 4: Handle any remaining disconnected nodes
  nodes.forEach((node) => {
    if (node.generation === -1) node.generation = 0;
  });

  // Normalize to start at 0
  const minGen = Math.min(...Array.from(nodes.values()).map((n) => n.generation));
  nodes.forEach((n) => (n.generation -= minGen));

  // DEBUG
  console.log('=== LAYOUT DEBUG ===');
  nodes.forEach((n) => {
    console.log(`${n.person.firstName} ${n.person.lastName}: gen=${n.generation}, spouses=[${n.spouses.map(s => nodes.get(s)?.person.firstName).join(', ')}], parents=[${n.parents.map(p => nodes.get(p)?.person.firstName).join(', ')}]`);
  });

  // Group by generation
  const byGen = new Map<number, LayoutNode[]>();
  nodes.forEach((n) => {
    if (!byGen.has(n.generation)) byGen.set(n.generation, []);
    byGen.get(n.generation)!.push(n);
  });

  console.log('Generations:', Array.from(byGen.entries()).map(([g, ns]) => `Gen ${g}: ${ns.map(n => n.person.firstName).join(', ')}`));

  const sortedGens = Array.from(byGen.keys()).sort((a, b) => a - b);

  // Create family units (spouse groups)
  interface FamilyUnit {
    members: LayoutNode[];
    x: number;
    width: number;
    parentKey: string;
  }

  const genUnits = new Map<number, FamilyUnit[]>();

  sortedGens.forEach((gen) => {
    const genNodes = byGen.get(gen)!;
    const processed = new Set<string>();
    const units: FamilyUnit[] = [];

    genNodes.forEach((node) => {
      if (processed.has(node.id)) return;

      // Collect this person and ALL their spouses in same generation
      const members: LayoutNode[] = [];
      const toProcess = [node];

      while (toProcess.length > 0) {
        const current = toProcess.pop()!;
        if (processed.has(current.id)) continue;
        if (current.generation !== gen) continue;

        members.push(current);
        processed.add(current.id);

        current.spouses.forEach((sid) => {
          const spouse = nodes.get(sid);
          if (spouse && spouse.generation === gen && !processed.has(sid)) {
            toProcess.push(spouse);
          }
        });
      }

      if (members.length === 0) return;

      // Sort: person with parents first, then alphabetically
      members.sort((a, b) => {
        if (a.parents.length > 0 && b.parents.length === 0) return -1;
        if (a.parents.length === 0 && b.parents.length > 0) return 1;
        return a.person.firstName.localeCompare(b.person.firstName);
      });

      const memberWithParents = members.find((m) => m.parents.length > 0);
      const parentKey = memberWithParents
        ? [...memberWithParents.parents].sort().join('|')
        : '';

      const width = members.length * NODE_WIDTH + (members.length - 1) * SPOUSE_GAP;
      units.push({ members, x: 0, width, parentKey });
    });

    // Sort units: those with parents first, then by parent key
    units.sort((a, b) => {
      if (a.parentKey && !b.parentKey) return -1;
      if (!a.parentKey && b.parentKey) return 1;
      return a.parentKey.localeCompare(b.parentKey);
    });

    genUnits.set(gen, units);
  });

  console.log('Units per gen:', Array.from(genUnits.entries()).map(([g, us]) =>
    `Gen ${g}: ${us.map(u => `[${u.members.map(m => m.person.firstName).join('+')}]`).join(', ')}`
  ));

  // NEW ALGORITHM: Position from bottom-up so parents are centered above their children
  
  // Helper to get center of a family unit
  const getUnitCenter = (unit: FamilyUnit): number => {
    const xs = unit.members.map(m => m.x);
    return (Math.min(...xs) + Math.max(...xs) + NODE_WIDTH) / 2;
  };

  // Helper to get all children of a family unit
  const getUnitChildren = (unit: FamilyUnit): LayoutNode[] => {
    const children: LayoutNode[] = [];
    unit.members.forEach(member => {
      member.children.forEach(childId => {
        const child = nodes.get(childId);
        if (child && !children.find(c => c.id === childId)) {
          children.push(child);
        }
      });
    });
    return children;
  };

  // Start by positioning the deepest generation (leaves) first
  const maxGen = Math.max(...sortedGens);
  
  // PASS 1: Position leaf generation (no children) simply left to right
  const leafGen = maxGen;
  const leafUnits = genUnits.get(leafGen);
  if (leafUnits) {
    let x = 0;
    leafUnits.forEach((unit) => {
      unit.x = x;
      unit.members.forEach((m, i) => {
        m.x = x + i * (NODE_WIDTH + SPOUSE_GAP);
      });
      x += unit.width + HORIZONTAL_SPACING;
    });
  }

  // PASS 2: Position each generation from bottom to top
  // Parents should be centered above their children
  for (let gen = maxGen - 1; gen >= 0; gen--) {
    const units = genUnits.get(gen);
    if (!units) continue;

    // For each unit, find its children and center above them
    units.forEach((unit) => {
      const children = getUnitChildren(unit);
      
      if (children.length > 0) {
        // Get the X positions of all children
        const childXs = children.map(c => c.x);
        const childMinX = Math.min(...childXs);
        const childMaxX = Math.max(...childXs) + NODE_WIDTH;
        const childrenCenter = (childMinX + childMaxX) / 2;
        
        // Center the unit above children
        unit.x = childrenCenter - unit.width / 2;
      }
    });

    // Now resolve overlaps: sort by x position and push apart if needed
    units.sort((a, b) => a.x - b.x);
    
    for (let i = 1; i < units.length; i++) {
      const prev = units[i - 1];
      const curr = units[i];
      const minX = prev.x + prev.width + HORIZONTAL_SPACING;
      if (curr.x < minX) {
        curr.x = minX;
      }
    }

    // Assign member positions within each unit
    units.forEach((unit) => {
      unit.members.forEach((m, i) => {
        m.x = unit.x + i * (NODE_WIDTH + SPOUSE_GAP);
      });
    });
  }

  // PASS 3: Now that parents are positioned, re-center children under their parents
  // This ensures children are properly aligned under parents (not the other way around)
  for (let gen = 1; gen <= maxGen; gen++) {
    const units = genUnits.get(gen);
    if (!units) continue;

    const byParent = new Map<string, FamilyUnit[]>();
    const orphans: FamilyUnit[] = [];

    units.forEach((unit) => {
      if (unit.parentKey) {
        if (!byParent.has(unit.parentKey)) byParent.set(unit.parentKey, []);
        byParent.get(unit.parentKey)!.push(unit);
      } else {
        orphans.push(unit);
      }
    });

    // Position sibling groups centered under their parents
    byParent.forEach((siblingUnits, parentKey) => {
      const parentIds = parentKey.split('|');
      const parentXs = parentIds
        .map((pid) => nodes.get(pid)?.x)
        .filter((x): x is number => x !== undefined);

      if (parentXs.length === 0) return;

      // Calculate parent unit center (including spouse gap)
      const parentMinX = Math.min(...parentXs);
      const parentMaxX = Math.max(...parentXs) + NODE_WIDTH;
      const parentCenter = (parentMinX + parentMaxX) / 2;

      // Calculate total width of all sibling units
      let totalWidth = siblingUnits.reduce((sum, u) => sum + u.width, 0);
      totalWidth += (siblingUnits.length - 1) * HORIZONTAL_SPACING;

      // Center siblings under parents
      let x = parentCenter - totalWidth / 2;
      siblingUnits.forEach((unit) => {
        unit.x = x;
        x += unit.width + HORIZONTAL_SPACING;
      });
    });

    // Resolve overlaps again
    units.sort((a, b) => a.x - b.x);
    for (let i = 1; i < units.length; i++) {
      const prev = units[i - 1];
      const curr = units[i];
      const minX = prev.x + prev.width + HORIZONTAL_SPACING;
      if (curr.x < minX) {
        curr.x = minX;
      }
    }

    // Final member positioning
    units.forEach((unit) => {
      unit.members.forEach((m, i) => {
        m.x = unit.x + i * (NODE_WIDTH + SPOUSE_GAP);
      });
    });
  }

  // PASS 4: Final pass - center parents above their children one more time
  for (let gen = maxGen - 1; gen >= 0; gen--) {
    const units = genUnits.get(gen);
    if (!units) continue;

    units.forEach((unit) => {
      const children = getUnitChildren(unit);
      
      if (children.length > 0) {
        const childXs = children.map(c => c.x);
        const childMinX = Math.min(...childXs);
        const childMaxX = Math.max(...childXs) + NODE_WIDTH;
        const childrenCenter = (childMinX + childMaxX) / 2;
        
        // Desired position
        const desiredX = childrenCenter - unit.width / 2;
        unit.x = desiredX;
      }
    });

    // Resolve overlaps
    units.sort((a, b) => a.x - b.x);
    for (let i = 1; i < units.length; i++) {
      const prev = units[i - 1];
      const curr = units[i];
      const minX = prev.x + prev.width + HORIZONTAL_SPACING;
      if (curr.x < minX) {
        curr.x = minX;
      }
    }

    units.forEach((unit) => {
      unit.members.forEach((m, i) => {
        m.x = unit.x + i * (NODE_WIDTH + SPOUSE_GAP);
      });
    });
  }

  // Center around 0
  const allX = Array.from(nodes.values()).map((n) => n.x);
  const centerOffset = (Math.min(...allX) + Math.max(...allX)) / 2;
  nodes.forEach((n) => (n.x -= centerOffset));

  console.log('Final positions:');
  nodes.forEach((n) => {
    console.log(`  ${n.person.firstName}: x=${n.x}, y=${n.generation * VERTICAL_SPACING}`);
  });

  const flowNodes: Node[] = Array.from(nodes.values()).map((node) => ({
    id: node.id,
    type: 'person',
    position: { x: node.x, y: node.generation * VERTICAL_SPACING },
    data: { person: node.person },
    draggable: false,
  }));

  const flowEdges: Edge[] = relationships.map((rel) => {
    const fromNode = nodes.get(rel.fromPersonId);
    const toNode = nodes.get(rel.toPersonId);
    const category = getRelationshipCategory(rel.relationshipType);

    let sourceHandle: string;
    let targetHandle: string;

    if (category === 'horizontal') {
      const fromX = fromNode?.x ?? 0;
      const toX = toNode?.x ?? 0;
      sourceHandle = fromX < toX ? 'right' : 'left';
      targetHandle = fromX < toX ? 'left-target' : 'right-target';
    } else {
      sourceHandle = 'bottom';
      targetHandle = 'top-target';
    }

    return {
      id: rel.id,
      source: rel.fromPersonId,
      target: rel.toPersonId,
      sourceHandle,
      targetHandle,
      type: 'smoothstep',
      style: { stroke: getEdgeColor(rel.relationshipType), strokeWidth: 2 },
    };
  });

  return { nodes: flowNodes, edges: flowEdges };
}

function getEdgeColor(type: RelationshipType): string {
  switch (type) {
    case RelationshipType.PARENT:
      return '#6366f1';
    case RelationshipType.SPOUSE:
      return '#ec4899';
    default:
      return '#94a3b8';
  }
}

/**
 * Compute the lineage of a person - their ancestors, descendants, and spouses.
 * Returns a set of person IDs that are part of the lineage.
 */
export function computeLineage(
  personId: string,
  relationships: Relationship[]
): Set<string> {
  const lineage = new Set<string>();
  lineage.add(personId);

  // Build adjacency maps for quick lookup
  const parentOf = new Map<string, string[]>(); // parentId -> childIds
  const childOf = new Map<string, string[]>(); // childId -> parentIds
  const spouseOf = new Map<string, string[]>(); // personId -> spouseIds

  relationships.forEach((rel) => {
    if (rel.relationshipType === RelationshipType.PARENT) {
      // fromPerson is parent of toPerson
      if (!parentOf.has(rel.fromPersonId)) parentOf.set(rel.fromPersonId, []);
      parentOf.get(rel.fromPersonId)!.push(rel.toPersonId);

      if (!childOf.has(rel.toPersonId)) childOf.set(rel.toPersonId, []);
      childOf.get(rel.toPersonId)!.push(rel.fromPersonId);
    } else if (rel.relationshipType === RelationshipType.SPOUSE) {
      if (!spouseOf.has(rel.fromPersonId)) spouseOf.set(rel.fromPersonId, []);
      spouseOf.get(rel.fromPersonId)!.push(rel.toPersonId);

      if (!spouseOf.has(rel.toPersonId)) spouseOf.set(rel.toPersonId, []);
      spouseOf.get(rel.toPersonId)!.push(rel.fromPersonId);
    }
  });

  // Add spouses of the target person
  const spouses = spouseOf.get(personId) || [];
  spouses.forEach((s) => lineage.add(s));

  // Collect ancestors (parents, grandparents, etc.)
  const collectAncestors = (id: string) => {
    const parents = childOf.get(id) || [];
    parents.forEach((parentId) => {
      if (!lineage.has(parentId)) {
        lineage.add(parentId);
        collectAncestors(parentId);
      }
    });
  };

  // Collect descendants (children, grandchildren, etc.)
  const collectDescendants = (id: string) => {
    const children = parentOf.get(id) || [];
    children.forEach((childId) => {
      if (!lineage.has(childId)) {
        lineage.add(childId);
        collectDescendants(childId);
      }
    });
  };

  // Start from the person and their spouses
  collectAncestors(personId);
  collectDescendants(personId);

  // Also collect descendants through spouses (their children are your children)
  spouses.forEach((spouseId) => {
    collectDescendants(spouseId);
  });

  return lineage;
}

/**
 * Get the set of relationship IDs that connect lineage members.
 */
export function getLineageEdges(
  lineagePersonIds: Set<string>,
  relationships: Relationship[]
): Set<string> {
  const lineageEdges = new Set<string>();

  relationships.forEach((rel) => {
    // Edge is part of lineage if both endpoints are in the lineage
    if (lineagePersonIds.has(rel.fromPersonId) && lineagePersonIds.has(rel.toPersonId)) {
      lineageEdges.add(rel.id);
    }
  });

  return lineageEdges;
}
