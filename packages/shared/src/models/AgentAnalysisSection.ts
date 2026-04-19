import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

export interface AgentAnalysisSectionAttributes {
  id: string;
  runId: string;
  sectionKey: string;
  payload?: Record<string, any>;
  createdAt: Date;
}

interface AgentAnalysisSectionCreationAttributes
  extends Optional<AgentAnalysisSectionAttributes, 'id' | 'payload' | 'createdAt'> {}

export class AgentAnalysisSection
  extends Model<AgentAnalysisSectionAttributes, AgentAnalysisSectionCreationAttributes>
  implements AgentAnalysisSectionAttributes
{
  declare id: string;
  declare runId: string;
  declare sectionKey: string;
  declare payload?: Record<string, any>;
  declare createdAt: Date;
}

AgentAnalysisSection.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    runId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'run_id',
      references: {
        model: 'agent_analysis_runs',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    sectionKey: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'section_key',
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'agent_analysis_sections',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['run_id', 'section_key'] },
      { fields: ['run_id'] },
      { fields: ['section_key'] },
      { fields: ['created_at'] },
    ],
  }
);

export default AgentAnalysisSection;
