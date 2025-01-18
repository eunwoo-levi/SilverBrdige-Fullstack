import { connectMongoDB } from '@/lib/mongodb';
import HealthRecord from '@/model/healthRecord';
import { NextResponse } from 'next/server';

interface ContextParams {
  params: {
    id: string; // URL에서 추출할 환자 ID
  };
}

export async function GET(request: Request, { params }: ContextParams) {
  try {
    await connectMongoDB();

    const { id: patientId } = params;

    // 특정 환자의 건강 기록 조회
    if (patientId) {
      const record = await HealthRecord.findOne({ patientId });

      if (!record) {
        return NextResponse.json(
          { error: 'Health record not found.' },
          { status: 404 },
        );
      }

      return NextResponse.json({ record }, { status: 200 });
    }

    // 모든 건강 기록 조회
    const records = await HealthRecord.find();

    return NextResponse.json({ records }, { status: 200 });
  } catch (error) {
    console.error('Error fetching health records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health records.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: ContextParams) {
  try {
    await connectMongoDB();

    // 요청 데이터 파싱
    const body = await request.json();
    const {
      patientId,
      height,
      weight,
      heartRate,
      bloodPressure,
      bloodSugar,
      bodyTemperature,
      pulse,
      oxygenSaturation,
      additionalNotes,
      medications,
    } = body;

    // 필수 데이터 확인
    if (
      !patientId ||
      !height ||
      !weight ||
      !heartRate ||
      !bloodPressure ||
      !bloodSugar ||
      !bodyTemperature ||
      !pulse ||
      !oxygenSaturation
    ) {
      return NextResponse.json(
        { error: 'All required fields must be provided.' },
        { status: 400 },
      );
    }

    // 환자의 건강 기록 생성
    const newRecord = await HealthRecord.create({
      patientId,
      height,
      weight,
      heartRate,
      bloodPressure,
      bloodSugar,
      bodyTemperature,
      pulse,
      oxygenSaturation,
      additionalNotes: additionalNotes || '',
      medications: medications || [],
    });

    return NextResponse.json(
      {
        message: 'Health record created successfully.',
        record: newRecord,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating health record:', error);
    return NextResponse.json(
      { error: 'Failed to create health record.' },
      { status: 500 },
    );
  }
}
