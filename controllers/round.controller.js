import { supabase } from "../config/supabase.js"

//Current active round (if any)
export const getActiveRound = async (req, res) => {
  try {
    const {data, error} = await supabase
    .from("rounds")
    .select("*")
    .eq("status", "ACTIVE")
    .single();

    if (error || !data) {
      return res.status(404).json({ message: "No active round" });
    }

    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Participant starts a round
export const startRound = async (req, res) => {
  const userId = req.user.id;
  const roundId = Number(req.params.roundId);

  try {
    // Check if round is active
    const { data: round } = await supabase
      .from("rounds")
      .select("*")
      .eq("id", roundId)
      .single();

    if (!round || round.status !== "ACTIVE") {
      return res.status(400).json({ message: "Round not active" });
    }

    // Check if already started
    const { data: existing } = await supabase
      .from("round_results")
      .select("*")
      .eq("userId", userId)
      .eq("roundId", roundId)
      .single();

    if (existing) {
      return res.status(400).json({ message: "Round already started" });
    }

    await supabase.from("round_results").insert([
      {
        userId,
        roundId,
        startTime: new Date(),
        finished: false
      }
    ]);

    return res.json({ message: "Round started" });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Participant finishes a round
export const finishRound = async (req, res) => {
  const userId = req.user.id;
  const roundId = Number(req.params.roundId);

  try {
    const { data: result } = await supabase
      .from("round_results")
      .select("*")
      .eq("userId", userId)
      .eq("roundId", roundId)
      .single();

    if (!result || result.finished) {
      return res.status(400).json({ message: "Invalid finish request" });
    }

    const endTime = new Date();
    const totalTime = Math.floor(
      (new Date(endTime) - new Date(result.startTime)) / 1000
    );

    const { data: responses } = await supabase
      .from("responses")
      .select("pointsEarned")
      .eq("userId", userId)
      .eq("roundId", roundId);

    const totalScore = responses?.reduce(
      (sum, r) => sum + r.pointsEarned,
      0
    ) || 0;

    await supabase
      .from("round_results")
      .update({
        endTime,
        totalTime,
        totalScore,
        finished: true
      })
      .eq("userId", userId)
      .eq("roundId", roundId);

    return res.json({ message: "Round finished" });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};


// Admin creates a new round (initially UPCOMING)
export const createRound = async (req, res) => {
  const { timeLimit } = req.body;

  try {
    const { data: active } = await supabase
      .from("rounds")
      .select("*")
      .eq("status", "ACTIVE");

    if (active.length > 0) {
      return res.status(400).json({
        message: "Another round is ACTIVE"
      });
    }

    const { data, error } = await supabase
      .from("rounds")
      .insert([
        {
          timeLimit: timeLimit ?? null,
          status: "UPCOMING"
        }
      ])
      .select();

    return res.status(201).json(data);

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin activates a round (sets it to ACTIVE, deactivates any other active round)
export const activateRound = async (req, res) => {
  const roundId = Number(req.params.roundId);

  try {
    await supabase
      .from("rounds")
      .update({ status: "COMPLETED" })
      .eq("status", "ACTIVE");

    await supabase
      .from("rounds")
      .update({ status: "ACTIVE" })
      .eq("id", roundId);

    return res.json({ message: "Round activated" });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const closeRound = async (req, res) => {
  const roundId = Number(req.params.roundId);

  try {
    await supabase
      .from("rounds")
      .update({ status: "COMPLETED" })
      .eq("id", roundId);

    return res.json({ message: "Round closed" });

  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};


export const getAllRoundsAdmin = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("rounds")
      .select(`
        id,
        timeLimit,
        status,
        questions ( id ),
        round_results ( id, finished )
      `)
      .order("id", { ascending: false });

    if (error) {
      return res.status(400).json({
        message: error.message
      });
    }

    const formatted = data.map(round => {
      const totalParticipants = round.round_results?.length || 0;
      const finishedCount =
        round.round_results?.filter(r => r.finished).length || 0;

      return {
        id: round.id,
        timeLimit: round.timeLimit,
        status: round.status,
        totalQuestions: round.questions?.length || 0,
        totalParticipants,
        finishedCount
      };
    });

    return res.json(formatted);

  } catch (err) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};