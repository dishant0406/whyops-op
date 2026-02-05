import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Create projects table
  await queryInterface.createTable('projects', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // Create environments table
  await queryInterface.createTable('environments', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.ENUM('PRODUCTION', 'STAGING', 'DEVELOPMENT'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // Add unique constraint on project_id + name
  await queryInterface.addConstraint('environments', {
    fields: ['project_id', 'name'],
    type: 'unique',
    name: 'unique_project_environment',
  });

  // Update api_keys table - add new columns
  await queryInterface.addColumn('api_keys', 'project_id', {
    type: DataTypes.UUID,
    allowNull: true, // nullable initially for migration
    references: {
      model: 'projects',
      key: 'id',
    },
    onDelete: 'CASCADE',
  });

  await queryInterface.addColumn('api_keys', 'environment_id', {
    type: DataTypes.UUID,
    allowNull: true, // nullable initially for migration
    references: {
      model: 'environments',
      key: 'id',
    },
    onDelete: 'CASCADE',
  });

  await queryInterface.addColumn('api_keys', 'entity_id', {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'entities',
      key: 'id',
    },
    onDelete: 'CASCADE',
  });

  await queryInterface.addColumn('api_keys', 'is_master', {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  });

  // Update provider_id to be nullable
  await queryInterface.changeColumn('api_keys', 'provider_id', {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'providers',
      key: 'id',
    },
    onDelete: 'CASCADE',
  });

  // Update key_prefix to support longer prefixes (YOPS-xxxxx)
  await queryInterface.changeColumn('api_keys', 'key_prefix', {
    type: DataTypes.STRING(20),
    allowNull: false,
  });

  // Add indexes for api_keys
  await queryInterface.addIndex('api_keys', ['project_id']);
  await queryInterface.addIndex('api_keys', ['environment_id']);
  await queryInterface.addIndex('api_keys', ['is_master']);

  // Update entities table - add new columns
  await queryInterface.addColumn('entities', 'project_id', {
    type: DataTypes.UUID,
    allowNull: true, // nullable initially for migration
    references: {
      model: 'projects',
      key: 'id',
    },
    onDelete: 'CASCADE',
  });

  await queryInterface.addColumn('entities', 'environment_id', {
    type: DataTypes.UUID,
    allowNull: true, // nullable initially for migration
    references: {
      model: 'environments',
      key: 'id',
    },
    onDelete: 'CASCADE',
  });

  // Add indexes for entities
  await queryInterface.addIndex('entities', ['project_id']);
  await queryInterface.addIndex('entities', ['environment_id']);

  // Drop old unique constraint on entities (user_id, name, hash)
  // and add new one (environment_id, name, hash)
  // Note: This might need adjustment based on your actual constraint name
  try {
    await queryInterface.removeConstraint('entities', 'entities_user_id_name_hash_key');
  } catch (error) {
    // Constraint might not exist or have different name
    console.log('Could not remove old constraint, might not exist');
  }

  await queryInterface.addConstraint('entities', {
    fields: ['environment_id', 'name', 'hash'],
    type: 'unique',
    name: 'unique_environment_entity',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remove indexes from entities
  await queryInterface.removeIndex('entities', ['environment_id']);
  await queryInterface.removeIndex('entities', ['project_id']);

  // Remove constraint from entities
  await queryInterface.removeConstraint('entities', 'unique_environment_entity');

  // Remove columns from entities
  await queryInterface.removeColumn('entities', 'environment_id');
  await queryInterface.removeColumn('entities', 'project_id');

  // Remove indexes from api_keys
  await queryInterface.removeIndex('api_keys', ['is_master']);
  await queryInterface.removeIndex('api_keys', ['environment_id']);
  await queryInterface.removeIndex('api_keys', ['project_id']);

  // Revert api_keys columns
  await queryInterface.changeColumn('api_keys', 'key_prefix', {
    type: DataTypes.STRING(12),
    allowNull: false,
  });

  await queryInterface.changeColumn('api_keys', 'provider_id', {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'providers',
      key: 'id',
    },
    onDelete: 'CASCADE',
  });

  await queryInterface.removeColumn('api_keys', 'is_master');
  await queryInterface.removeColumn('api_keys', 'entity_id');
  await queryInterface.removeColumn('api_keys', 'environment_id');
  await queryInterface.removeColumn('api_keys', 'project_id');

  // Remove constraint from environments
  await queryInterface.removeConstraint('environments', 'unique_project_environment');

  // Drop environments table
  await queryInterface.dropTable('environments');

  // Drop projects table
  await queryInterface.dropTable('projects');
}
