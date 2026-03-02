import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

export type AgentJudgeSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AgentAnalysisFindingAttributes {
  id: string;
  runId: string;
  dimension: string;
  code: string;
  title: string;
  detail: string;
  severity: AgentJudgeSeverity;
  confidence: number;
  frequency: number;
  impactScore: number;
  evidence?: Array<{
    traceId?: string | null;
    signalType: string;
    snippet: string;
  }>;
  rootCause?: string;
  recommendation?: Record<string, any>;
  patches?: Array<Record<string, any>>;
  createdAt: Date;
  updatedAt: Date;
}

interface AgentAnalysisFindingCreationAttributes
  extends Optional<
    AgentAnalysisFindingAttributes,
    | 'id'
    | 'confidence'
    | 'frequency'
    | 'impactScore'
    | 'evidence'
    | 'rootCause'
    | 'recommendation'
    | 'patches'
    | 'createdAt'
    | 'updatedAt'
  > {}

export class AgentAnalysisFinding
  extends Model<AgentAnalysisFindingAttributes, AgentAnalysisFindingCreationAttributes>
  implements AgentAnalysisFindingAttributes
{
  declare id: string;
  declare runId: string;
  declare dimension: string;
  declare code: string;
  declare title: string;
  declare detail: string;
  declare severity: AgentJudgeSeverity;
  declare confidence: number;
  declare frequency: number;
  declare impactScore: number;
  declare evidence?: Array<{
    traceId?: string | null;
    signalType: string;
    snippet: string;
  }>;
  declare rootCause?: string;
  declare recommendation?: Record<string, any>;
  declare patches?: Array<Record<string, any>>;
  declare createdAt: Date;
  declare updatedAt: Date;
}

AgentAnalysisFinding.init(
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
    dimension: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.5,
    },
    frequency: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    impactScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: 'impact_score',
    },
    evidence: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    rootCause: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'root_cause',
    },
    recommendation: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    patches: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'agent_analysis_findings',
    indexes: [
      { fields: ['run_id'] },
      { fields: ['dimension'] },
      { fields: ['severity'] },
      { fields: ['code'] },
      { fields: ['created_at'] },
      { fields: ['run_id', 'dimension', 'severity'] },
    ],
  }
);

export default AgentAnalysisFinding;
