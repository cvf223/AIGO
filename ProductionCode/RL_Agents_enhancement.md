Demo Thrills production spills. That's the unfortunate story for most AI projects. The fix of bulletproof evals workflow.

On May 19th, past TWIML guests Hamil Hussain and Shreyas Shankar kick off a four week, 20 session, live course on evals to teach you how. You'll code through real projects to master systematic error analysis, synthetic test data, automated eval pipelines, self-improving data flywheels and more. Daily office hours, a private discord, bonus sessions by guest experts, lifetime video access, reusable templates and 1K and modal credits are all included to set you up for success with your own projects.

And it's all backed by Maven's money back guarantee. TWIML listeners save 36% using code SamTwiml at twimlai.com/go/evals. Hope to see you in the course.

Basically, look at OpenAI's deep research agent, right? So they have been telling us to just prompt models, but they ended up using fine-tuning, RL fine-tuning to actually build this agent, right? And the reason they do this is because objectively, yes, I think the prompting only gets you so far.

You want to use RL as a way to teach the model what's good, what's bad, and how to “reason through things and so on.”

“All right, everyone, welcome to another episode of The TWIML AI Podcast. I am your host, Sam Charrington. Today, I'm joined by Mahesh Sathiamoorthy.

Mahesh is co-founder and CEO of Bespoke Labs. Before we get going, be sure to hit that subscribe button wherever you're listening to today's show. Mahesh, welcome to the podcast.

Thank you, Sam, for inviting me, and I'm pretty excited to be here.

I'm excited to have you on the show, and really looking forward to digging into our conversation. We're going to be talking about some of the work you and your team are doing to improve AI models using reinforcement learning and how you've extended that work to agents. To get us started, I'd love to have you share a little bit about your background.

Oh, yes, definitely. So, yeah, right now I am co-founder and CEO of Bespoke Labs, and before this, I spent a while at Google. And most recently, I was at Google DeepMind, and basically training LLMs for recommendation systems.

A whole bunch of continual pre-training and post-training work so that we can take existing models and shape them into good recommender models. So I did “a bunch of research as well as engineering work. Also had some of these work published, so we came up with something called generative retrieval, which is now used across the industry.

What from that experience inspired you to start Bespoke?

So I was in the extended BARD team, now called Gemini, and one thing was very clear is like the role of data, right? So there was a huge difference between where BARD started, you know, after the 100-day sprint, and then eventually as model kept improving, it was, there was of course some modeling improvements, but everything is all about data. So, you know, it's all about what data recipes we use, how we curate the data, how we filter out data and so on.

So, I mean, I felt like there was a huge missing component around this externally that people didn't have access to these tools, didn't have access to these insights. I mean, there is also something educational here is like, okay, just people don't spend as much time looking at the data. That's something I want to change is like people looking at the data has like so much alpha and, you know “working on the data, improving the data rather than spending time on like, okay, what's my hyperparameter?

How do I change learning rate and so on? So, that's the kind of thesis. And also, you know, my co-founder has been involved in what's called Data Comp.

He's Alex Dimakis. He's with faculty with UC Berkeley. And there, again, the goal is like all about like, how do you curate the data?

So, fix the model, create best data that improves model performance. So, for us, it was the shared thesis on like the importance of data. That's how we kind of launch Bespoke Labs.

Yeah, it's interesting hearing you articulate it like that. There was a move, I think, spurred on by Andrew Wang a few years ago, focused on data-centric AI that was like just pre-gen AI. But those same ideas are still important.

Those same ideas are exactly still important. It's just that people somehow seem to have kind of lost the train of thought there. So, you know, like it's basically like if you look at, you know, all the improvements in Lama or everywhere, it's all about the data, right? 

“So even in our case, we have been training a bunch of models and, you know, most of the time, all the improvement is coming from data. And then some improvement is in the modeling side.

Yeah, maybe it's true that it's invisible to more people than before in the sense that, you know, previously, if you were doing anything significant with a model, it's because you were able to do it because you built it yourself and you had to collect the data, you had to label all that data. So you were intimately aware of the role that data plays. Now we're able to pull these models off the shelf that, you know, have been trained on everything there is to some degree.

And for, you can get a lot done without having to think about the data.

That's true to some extent, but also what happens is like you, a lot of people are prompting models, right, to get things done. But the other component is like, how do you evaluate? And there, you still need to curate data.

As an example, maybe you are training a model for a specific, you know, question and answer generation 

“on your corpus and so on. And, you know, you can prompt the model and say, okay, these are the kind of rules to follow. But ultimately, you want to actually evaluate if this is good and where do you get the evaluation done, right?

So it's again, like you have to take your corpus and curate some data and create the evaluation data set. So there again, data basically plays a role. And also it's not just data, but also there is like tooling around how you kind of visualize data, right?

So sometimes the model is doing something very complex, it's producing a bunch of complex JSON, or you have an agent, it's taking a whole bunch of trajectories. There are no good tooling out there to actually just look at the data. You don't need to use it for fine-tuning or anything, just being able to look at the data and read what's happening, that just unlocks a lot of things, right?

So one of the things we think about is like, when you're evaluating, you have two steps. So one is evaluation, which is, okay, maybe the model is 94% accurate or some number like “that. But the second thing you need to do is error analysis.

So again, I don't think a lot of people are intimately familiar when they talk about this. People just stop at evaluation. But what you really need is evaluation and error analysis, where you see what kind of mistakes the agent or the model is making.

And this is something you can kind of, to some extent, automate, but most of the time, you have to just read what's happening. And then you realize, oh, it's actually making these kind of mistakes. And then you realize it's because the retrieval didn't work or the model is hallucinating and so on.

And then you go back and fix your prompts or fine-tune the model and so on. So again, what I'm getting to is like the data curation actually means tooling to, of course, munch the data filter and so on, but also being able to just visualize, read and annotate and those kind of things that you need to do.

We're going to be digging into some of the work that you have done around reinforcement learning. But do you see RL as a tool in kind “of the same regard as what you discussed in terms of data curation? Or are there other things that you've either developed internally or have published that are kind of more end user tools to aid in that kind of data curation?

I think taking a step back, the reason why we work on data curation is not to help with data curation per se, but basically people want custom models and custom agents, right? So if we just look at the model part, and if you are trying to fine-tune a model, if you look at what's the reason why these projects fail, it's because of the data curation part, right? So I think the kind of mental model or the thing that I kind of think through on use is, like there is this book called The Crux by Richard Rumelt, I think, and there he talks about how you have a gnarly problem and you want to kind of figure out what's the crux or what's the bottleneck that's critical that you want to solve.

So I think the example he gives is like you want to get to Mars and how do you build a“system around this, right? You can work on making the rockets faster or all sorts of things, but if you think through what's the crux of the problem is like you want to get reusable rockets because the cost is the limiting factor and like having a system that sends people to Mars. So it kind of helps you figure out what is it that you need to solve.

So similarly for post-training which people want to do for various reasons, the reason the place where they fail usually is in the data part and that's the reason we started with data and we kind of build some tooling around like visualization and also curation. We have something called curator, but also now what's happening is like people want to build custom agents. And there, I think, yeah, like you said, RL is one of the methods or one of the tools to kind of get this going.

So before we dig into RL, can you talk a little bit about curator?

Oh, yes, yes. Curator is now an open source library, which makes it pretty easy or seamless to actually curate data. So if you want to kind“of say, if you want to fine tune a model, you want to basically not worry about the infrastructure around like data curation, you should be able to pick and choose the different models.

You should be able to use structured output to kind of, you know, guide in different stages of doing the data curation. And then you don't want to worry about the retrace and failing and failures and so on, especially when you have like a million examples that you want to create, so that the fine tuning data.

When we're talking about data curation here, are we primarily talking about synthetic data generation?

Basically, yeah, anytime you use LLM to do something, so you could be using LLM to filter your existing human data, or you could be generating more LLM generated data, so that becomes the synthetic data, right? So in any of these situations, say, when you have a lot of data you want to curate, or even otherwise, you want a systematic tool that kind of helps you curate data. So there are a bunch of tooling around just prompting models, you know, light LLM and whatnot, but those are specifically geared towards “prompting models and you use them in an online fashion and so on.

Here it's all about like, okay, to a large extent batch mode, offline working and like you want the data, you want to make sure the throughput is high, and then also ways to visualize if the data quality is good and so on. So all of those together is packaged into what's called curator, and some components of it is open source, and then we have ways to kind of upload the data, view what's happening and so on. So that's a bit, yeah, on the closed source side.

Let's dig into RL and start very broad. This is something that we've talked about on the podcast before, but I'd love to hear your particular take on it. We've covered RL for years.

RL has been around for years, and historically, it's been thought of as this kind of aspirational, but kind of very brittle approach to building out ML models or agents. But recently, we've seen kind of an explosion in its use in association with large language models, you know, DeepSeq, R1, that kind of that moment comes to mind as really illustrating the“kind of growing importance of RL. Can you talk us through, you know, what's new and different about this contemporary application of RL and why it's important?

For many people, yes, DeepSeq, R1 happened on like, it was on the MLK day, I think, in January. And we all look up to the paper and we were like, this is pretty amazing. And we realized the dataset is missing, right?

So what they did was they announced the DeepSeq, R1 and also the distilled models, 32B and 7B, it's all open model, but the data was not something that they released. So what we did was we, given that we had actually built Curator, which is good in like data creation, we were able to actually quickly get started and start generating a reasoning dataset, which there weren't many such datasets available, especially high quality. So we took the DeepSeq R1 and we had curated our own prompts, which is similar to prior work that was done.

And then we used Curator to basically generate the answer as well as the reasoning trace. And we organized a dataset and we kind of released this as well as the 32B model“that was trained on this. So this was the Bespoke Stratos model, which we pulled it off in like 48 hours.

And so, yeah, so that was pretty well received. And people realized that, okay, this kind of data is important. And so what we then did was we went back and we started to work with a whole bunch of people in the community, open source community.

There was this community called, of people doing data comms. So we all worked together. We created this, you know, org slash, you know, consortium called Open Thoughts and Open Thinker.

In order, the goal has been to curate data, reasoning data that people can then use to train reasoning models. I'll kind of touch upon why reasoning is important and how it's related to RL and so on. But the goal of Open Thoughts has been to basically create really good quality data.

And along with that, that's called Open Thoughts because that's the thoughts of the model. And the Open Thinker is the model that we train on top of this. And both have been pretty well received, I think.

Open Thinker model, now the 32B model actually beats the “DeepSeeks 32B model. So that was, you know, it's a good achievement for all of us who work together. And then the data set has also been used, like more than 200, for training at least more than 200 models that we know of.

So at the, the reason this is all popular and useful is that it's unlocking what's reasoning. And it's kind of tightly connected with RL. And what we did earlier is like, OK, we just showed how you can do just using SFT, unlock reasoning in non-reasoning models.

And now the next phase is like, how do you use RL to further augment this? So that's the other work we have been doing at Bespoke, is like using RL to make the model reason through. And specifically, we were targeting tool use, because that's one of the key components of building agents.

And basically, where I am going with this is like, ultimately, we want to help people build agents. And the way I see is like, right now, people are just prompting away models, and like they have these complex series of prompts, they end up in a prompt hell. It's kind of pretty
“Basically, what's happening is like, you put together all these prompts, and then something works or doesn't, and you don't know why.

It's very fragile.

Yeah, it's very fragile, and then you are like, okay, maybe I will change a prompt here, or maybe I will ask the model, okay, please, please follow all these instructions and so on. So, yeah, all of this, we want to kind of replace with using RL, because that makes it... That's a much more flexible mechanism to build agents, and the agents especially that can use reasoning.

And so, that brings a lot of question for me. It strikes me that, you know, starting from this place of, we want to build more sophisticated applications or agents built on top of LLMs, but prompting is brittle. One kind of possible direction is, let's, you know, optimize prompting, and that's like DSPy and tools like that.

And then I hear you talking about a different direction, which is, let's rather fine tune models using RL and curated data to make them, what? Is it to make them better at following instructions? Is it to make them, you know, more robust in interpreting prompts? “Like, what is the thing that you're changing by applying RL?

Right, I think the example I give is basically look at OpenAI's deep research agent, right? So what they, they could have built that agent using by prompting O3 or O3 Mini or O4, but they ended up using RL fine tuning, right? So they have been telling us to just prompt models, but they ended up using fine tuning, RL fine tuning to actually build this agent, right?

And the reason they do this is because objectively, yes, I think the prompting only gets you so far. It's like giving all sorts of instructions. So yeah, I think basically you want to use RL as a way to teach the model what's good, what's bad, and how to, it's not about following instructions, but basically the model learns to figure out, okay, these are the parts to follow, this is how to reason through things, and so on.

So again-

So it's about reasoning and kind of- Reinforcing that thought trace process.

And also, yeah, and also punishing the bad behavior, bad behavior meaning the things that fail. So yeah. So I think what's happening with prompting is “like people prompt models and build agents, but they have no way of completing the feedback loop, right?

So you have all these prompts, and your agent either worked or it didn't work. And now what do you do with that information? There is no-

You try telling the agent that, hey, this didn't work, but it's like, that's just another prompt. That's just more text.

And then you change the prompt. Yeah, exactly. So you can use RL to-

So you're saying, like, you're- Essentially, what the process is doing is, like, baking that feedback into the model that you can then run, as opposed to, you know, trying to do that interactively at runtime.

I think this also connects back to the bitter lesson that we are all familiar with. It's like, at the end of the day, what bitter lesson says is, like, you don't want to relate too much on the human intuition. You just let the model search and learn, right?

So, you, that's the whole point. So, here with prompting, we are actually, like, giving the model all sorts of this human intuition, saying, okay, you know, at this stage, this is what you “should do. At this stage, this is what you should do.

So, that is very brittle. The bitter lesson actually says, in a way, don't do this, but you should let the model figure that out by itself, if all you need to do is set up... So, there are three things, right?

You have the algorithm, but also set up the environment in which it's working. You kind of have a way to verify and give rewards, depending on if it is doing correctly or not. Yeah, and then basically, you just let it learn from the different scenarios.

It does all sorts of rollouts, gets the rest of the reward, and then it learns how to reason through things. And it avoids this pitfall of humans writing all these complex prompts. And also, again, yeah, I think it helps us connect the feedback loop, right?

So in the other one where you have prompts, there is no way to connect back the output. The feedback loop is not connected here. It basically implicitly does that.

And so an analogy here is maybe fine-tuning, is, and when I think of fine-tuning, I often think of like taking “a generic base model and making it better at a particular thing. Like, do you, do you find, are you thinking about this process of improving models with RL as making better general models or taking general models and making them better at a particular task?

Yeah, it's the latter actually. So, models are actually just in general getting better, right? So, we don't want to fight that train of improvement.

But I think the other thing to think is like, what's in distribution and what's out of distribution, in the sense that all the frontier models, what they are in distribution is like, what's happening around the world, but they don't know what's happening inside an enterprise, right? So, that is out of distribution for these frontier models. They can never get better on these tasks.

And so, our hope and what we are pitching is like, okay, we can build all this tooling that can be used so that the models, you can take open source models and they understand your environment, your ecosystem, and they get better in the tasks that you care about.

One of the ways, in fact, you recently published some work on using “RL to improve tool calling or function calling in models. That's a particular way of adapting a model, a generic model to a particular environment, the environment, in this case, being a set of tools that are available. Is that the right way to think about it?

Exactly, yeah. So, we have talked to many people building agents. So, the issue they run into is like, they have all sorts of APIs and tools internally, and what they end up doing is like they-

Well, they do now post-MCP. Before, it was like struggling to get these tools integrated in. Now, they're all over the place.

They're all over the place, yeah. Also, what happens is like they, basically, they have to specify, okay, these are my tools and all sorts of definitions around it and so on. And before you know, the prompt is very complex and agent takes very, the latency adds up like anything and it also becomes very expensive.

So, yeah, basically, what we are trying to do is like we are helping enterprises be able to kind of bake that knowledge into the model. So, you can take any open source model and then“the model basically it's like you are hiring a human, right? So, I can go in and like take a look at what's happening.

You can tell me all the things, but maybe I need some training to kind of get used to an enterprise and you know, when I start doing work at a company, right? So, that's the process of, you can think of as like a combination of reinforcement learning and SFD to kind of get the model trained in your system so that it becomes adapted using your tools.

I want to circle back to a question that I asked earlier, which was essentially like, why RL, why now, why is it different? Yeah.

Correct. Yeah, RL has been there for a very long time, right? I don't know, maybe 30 years or so, I think.

And RL has also been effective, right? Like in AlphaGo, AlphaZero, RL has been pretty effective. So, I think what's happening now is, I think the LLMs, so let's take a step back and see, I think the, you know, if we think of like the Shakespeare monkey writing Shakespeare thing, you can have it, you know, I don't know“, millions or billions of monkeys writing, and maybe one will get right.

So, maybe you can do something, Alpha, sorry, the whole point of RL is it's like trying things out, and you are also giving guidance on what's good and what's not good. If you throw a ton of compute, then it will get at some point, all the things that you needed to get right.

You'll find your monkey in a haystack.

Exactly, you can find your monkey and you can also train it, but it's just going to be very expensive. But what's happening now with LLM is like, these LLMs are like, you don't need a monkey, you can actually train a human, right? They come like acute with world knowledge.

So you don't need to like throw in lots of compute, you can put a little less compute, a lot less compute. And that's what I think we are seeing is like, okay, let's break this down into, again, three things, right? The algorithm, there have been many of these algorithms, so PPO, actor critic and whatnot.

So lots of algorithms have been there. And now people are using GRPO, which is, to a large“extent, it's similar to existing algorithms, but it does a few things, there are a few tricks there. And then what we have is the environment, and then there is verification and reward shaping.

And then the prior knowledge. So I think that's what has changed is like, these LLMs come with prior knowledge. So the number of rollouts you need to do, number of trial errors that the model does, it's not like millions of things it has to try, but like hundreds of things.

So that's kind of what has changed is these models are now generally very capable. And you just nudge it in the right direction and use GRPO, you set up the environment and you use a reasonably good reward model or reward shaping and you kind of get this working. So that's the huge analog that DeepSeq also showed.

And people have been doing this also at the Frontier Labs for a while.

So essentially in prior applications of RL, there was a bootstrapping problem. You're starting with this agent that knows nothing, it needs to bounce around on all the walls and kind of do a lot of things just to start to “gain a foundational understanding. But now, due to the models being more powerful and incorporating world knowledge, as well as, I think, the flip side of that is we're constraining the use case base a bit to text and to things that the models know about.

We've got this kind of synergy that allows you to make a lot of progress on less compute.

I mean, I wouldn't necessarily call that a limiting factor. You can always let the RL algorithm run longer, if you have a completely new domain, or start from scratch, if that makes sense. The other example here is like AlphaZero and AlphaGo.

AlphaZero is completely trained from scratch, so it uses a lot more compute, whereas AlphaGo, it starts from some sort of SFT, some sort of human intuition, that's baked in. So that's like what we have now is like AlphaGo moment, which is you take these LLMs, they kind of understand the world, so they have been SFTed and whatnot. It's a reasonable starting point.

And then we are able to do things that we wanted to do. I think this is what David Silver and Rich Sutton, they have written in the “Era of Experiences, like we are probably eventually, we will move to AlphaZero where we are not bounded by human intuition. You don't need so much SFT and like human curated data, and it just kind of learns itself what it needs to do.

Can you talk a little bit about reward shaping and what is involved in kind of setting up the problem of applying RL to foundation models?

So I think Andrej Karpathy had this tweet some time back saying, English is the hottest new programming language. So he was just saying, okay, now in order to control these models, you just specify in English, right? So now I think what's happening is like, the way I think is like, okay, reward shaping is the new prompting or new programming language, right?

So it's about how you shape the reward. But what we have found, so basically, yeah, you are giving it either a positive reward, say plus one when it gets the answer right or a minus one. And sometimes we do see that the model does what's called reward hacking.

So the agent kind of finds a shortcut to kind of get the reward that we are promising it by not doing actually the things it needs to do. So that's where I think some form of reward shaping is needed. It's like you try to figure out how to actually reward the model.( Solved by implementing blockchain proof now reward hacking possible correct ??!! )

But at least in our recent work, we found that simpler the reward, the better it is. Maybe this is some form of Occam's Razor. In fact, we started with a very complex reward procedure saying, okay, if it follows the specific format of tool calling, then we will give this much reward.

If it gets to the right answer, we'll give it this much reward. If not, then we had this complex system. It wasn't really needed.

Ultimately, we found that just having something much simpler works well.

It sounds like the bitter lesson applied to reward shaping.

Yeah, kind of. Yeah, exactly. I think robotics folks have spent a lot of time on reward shaping and how to figure rewards out.

So I think we will see spillover of that happen for LLMs. I think we are still in the early stages, so there is a lot more work. I think the interesting question now is like, if you are “training a model like a deep research agent, how do you design rewards there, right?

Do you kind of reward the intermediate, if it gets something intermediate also correct, or do you just give the final reward saying, okay, did it find what I'm looking for or not?

So what did you find or what were you able to accomplish in applying RL to tool use?

Okay, so tool use is basically useful for agents. So how do you do tool use? One is you can do SFD or use reinforcement learning, as RL-based fine-tuning.

So for SFD, what happens is like, you have to get all sorts of data, maybe in the tens of thousands of examples of saying, okay, this is my question, this is how the tool call should have been, and so on. So that gets a little complex and cumbersome. And also if you imagine the model takes, the agent is supposed to do like multi-turn, like it takes, for a given prompt, it has to say call multiple tools, and then it comes back with the result, and then based on the result, it has to call something else.

This becomes“very complex to get the data for doing SFD. What we found is like RL is actually much nicer to work with because you don't need as much data, and all we needed in that particular case was like 100 good quality examples, instead of say like tens of thousands. And also you don't need the full demonstrations.

The fact that the models have good prior knowledge, they are able to come up with some reasonable attempts. And so you just need the prompts, and you need a way to verify if the answers are good. So RL made it much easier for us to basically train these agents compared to SFD.

So that's the main finding, and that's the main thing that we are excited about.

So practically speaking, can you drill in on how you get from the much smaller set of examples to applying RL to address this problem?

Right, right, right. So in RL, I think what you need, basically what you need is you have a prompt and you need an environment where the agent is trying things out and you need a way to verify if the answer is right or not. So this “is in RL, right?

In SFD, all you need is like, okay, here is my prompt, here is the actual response that it should be doing. So we don't need that. In RL, now we have a bunch of prompts that says, okay, book a flight ticket on this day, when the cost is cheaper, blah, blah, blah.

So that's one example prompt. And then the agent acts in a specific environment where it's able to try things out. It's like a fake environment, right?

It's not actually booking flights. So you need to construct these realistic environments. And then you have the rewards that you set up and verify if things are working.

And you put it all together and run it with GRPO. So the way RL algorithm GRPO works is like it takes one of the prompts and it has what's called rollout. So eight different times it tries.

And then for each of them, you get a reward. And based on the reward, you compute what's called an advantage. And that tells you if you should go in which direction you update the model.

And the tries are responses to the prompt. So, and those are “judged by an LLM, presumably, a verifier?

You can use a...

Can be LLM, can be regex or whatever.

It can be regex, but all it can be as simple as saying, okay, did the actual action take place, right? If you actually call the tool, it may be it returns something. So, and you know what the right response is.

Oh, meaning you wire it up to a real function and you see if it actually can call the function with real data and or simulator of the real function.

Yeah, simulate, simulate, right.

But in other words, you're not just evaluating the text, you're doing something with the text that inherently demonstrates whether it works or not.

Exactly. You can also have a reward function that just looks at the text, in which case you can use LLM to say, okay, is this function making sense? Or you can just execute and get a response back and use that as the reward.

Got it. Got it.

So yeah, I think the other example would be in the case of say, deeper search, basically you can give a reward based on whether it actually found out the specific thing“you are looking for, right? So yeah, you don't need to guide it to say, okay, first you do this Google search and then you parse the website and all those things. You can just have a prompt and then the final response is like, did the actual thing happen or not?

And the environment and kind of the infrastructure, if you will, to generate the rollouts and evaluate them, and is that something for which some set of a tool, open source tool, or some set of tools exists, or is it all very bespoke compared to what, relative to what you're trying to do, and so it's just people do it in notebooks, and it's not particularly generalizable?

It is, to a large extent, generalizable. So there are a bunch of libraries here which can be used. So the most famous is like VERL, which people use to do RL GRPO training.

So now, a whole bunch of others like Unslaught, Hugging Faces, TRL, all of them support this. And then you need to build on top of it, basically, to be able to instrument an environment with it, right? So the base layer is how you execute“GRPO.

So the GRPO is, yeah, that's the foundation and then there's the environment stuff and is that generalizable as well?

It is, so there is, there are no good libraries out there, actually, there is, that's one of the opportunities is basically building something that makes it easy for people to plug and play different environments. So that's something we are, of course, working on now. Yeah, so what I'm saying is like, yeah, there is all this infra, some infra exists, then ultimately we want to build the agent, but there are still some missing components.

And yeah, that's kind of some of the infra that we are building so that it makes it easy for people to plug and play different environments, to find their rewards and be able to train fully functioning agents.

And can you talk a little bit about the compute requirements or cost or like some metric of like what went into getting the results you saw for the tool use example?

Correct. I think this is where it differs from SFT. In SFT, I think, like I was saying, right, so in RL, it's like it's a trial and error.

So it“has to try many times and then fail and then like learn. Whereas in SFT, you are like saying, okay, here is what you need to do. Just learn it.

So the compute for SFT is typically lower. The compute requirement for RL is kind of higher. But I do see that there are a lot of improvements coming in in terms of like maybe the algorithmic changes, but also how you do the rollouts, how you optimize the infra.

So that's been helpful. But overall, I do see that the RL is a bit more expensive as compared to SFT. So again, the one we tried, it's like a small data set.

We had like H200s, four of them. I don't remember the number of hours, but I think if we did the same thing with SFT, it would be a lot cheaper.

At the same time, for H100s, like, we're not talking about the RL of old, where you're running this thing for weeks or months or whatever on a cluster of machines. It sounds relatively attainable by, you know, a general enterprise or someone who has a problem for which this applies.

Yeah, it all depends on“the complexity of the problem. We have also tried using RL for improving on math reasoning and AIME and things like that, Math Olympiad. Right, so there you have a lot more data and you are trying to train a slightly larger model.

So there the compute costs are kind of significant. In many other places, you can actually, if you have a limited set of tools and if you orchestrate it well, if you do some amount of SFD and then do RL, you can actually make this quite attainable.

Do you envision or maybe how far do you think we are from, I guess maybe a couple of different milestones. One is, this as a technique is something that is applicable by an engineer versus a researcher. And then maybe the next milestone beyond that is like, there's some automated tool that will kind of fine-tune your off-the-shelf model for your agentic task.

Are either of these attainable in your view? And if so, like, how do you think we get to those things or, you know, when or?

To a large extent, our goal is to actually democratize access to these tools, right? So“even with data curation, it's like, okay, all the frontier labs have good tools that people should have access to so that they can train good models as well, right? They don't have to rely on OpenAI training the best model and then use that.

So they should be able to train good models for their use cases. So that it's actually cheaper and better quality and so on. Similarly, I think here also there is an opportunity to democratize tooling.

Our ultimate goal is like, okay, this is not restricted to researchers, but all the AI engineers who are now prompting should be actually using these tools to build agents, right? So for me, that's my personal goal is kind of not have people spend so much time on prompting, but actually fine-tune and do all these things. I guess I'm slightly biased because I'm an ML engineer and all of this is intellectually stimulating to actually fine-tune a model rather than prompt it.

But in general, I feel like there is a lot of benefits to doing this, so I want to make it accessible to as many people as possible. But I guess taking a“step forward is like, okay, maybe we build an agent that builds an agent. That's kind of what you are mentioning is like how much we can automate.

I think there is well-defined data recipes, well-defined ways of reward shaping and so on. So a lot of this could be codified and an agent or some tool can automate a bunch of things and have people ultimately build custom agents much faster. In terms of time frame, yeah, that's kind of tough to estimate, but maybe in a year or so, like things are moving rapidly.

We have Devin that's an autonomous software engineer. Maybe we have something that's autonomous ML engineer, or AI engineer.

On the kind of returning to the two use example, how did you evaluate the results of the effort? Is it you have this data set? Did you evaluate the non-fine tuned model and its accuracy with these two calls versus the fine tuned version?

Right, so we take a base model. We took a QANN instruct model, 7B, and then we do RL. And there is like qualitative and quantitative.

So you can basically, we took a tool calling data set“. It's called BFCL. It's a benchmark, actually.

So you split it into train and test. And then you can see how the model does after you fine tune. So that's one thing.

And then you can also look at it qualitatively, what it does. We did see that the reasoning actually improves. So the non fine tune model would just, you know, make some kind of silly mistakes or it was mostly doing just single turn.

After you did RL, it became, it was able to do multi turn tool calling. So it would actually call one tool, look at the response and then decide, okay, based on this, I need to call a different tool. So that's, that was quite, that was the qualitative evaluation we did, which was quite nice to see that the model is actually picking this up without us having to curate any of the data.

So that was our way of evaluating. I mean, the other thing we could have done is like, actually, SFT and then compare SFT with RL, but we didn't have the data, right? So this whole benchmark is like 200 or so examples.

So we would have needed like“a lot more examples. We did do some SFT work before we were running into all sorts of issues. So we didn't really do SFT to compare RL against SFT here.

Is it possible to capture the data that's generated in the RL process and use that as prompts for SFT? I guess the issue is that you need the answers. You need the labels, but...

Right. Actually, that's... So DeepSeq R1 actually does something like that.

So in this case, things worked fine. But then in the large scale DeepSeq, what they do is they had the DeepSeq R1 zero. They didn't do any SFT.

They did just the RL-based fine-tuning. And using that, they got a model and they used that model to generate some data, which then went into the SFT step. So yeah, to kind of answer your question, even here, you could actually fine-tune using RL and then use that model to generate data.

Basically, once you have this model, it's now good at figuring out how to do tool calling. You can get the data. Maybe you distill it further.

So all sorts of things can be done here. The other“thing you can also do is like you do some SFD and then start RL. So there is a lot to, a lot of wiggle room and like a lot of experiments that we can run.

You mentioned that one of the qualitative differences you saw was this multi-turn tool use and RL tune agent being better at that. Can you elaborate on that in particular? The question is, what is, how is multi-turn different from single turn?

Is it because it needs the information from the prior turn to figure out the subsequent tools? Is it that the agent is somehow anticipating future turns? Or what does it actually mean?

I mean, there's one scenario in which an agent, like there's a problem that can be solved either by making one tool call or by making several subsequent, several iteratively getting to a problem and like a strong reasoner should recognize that maybe solving, maybe using the calculator, then looking up the exchange rate, then doing something else with that, that that will get you to an answer even if you don't have a single tool or better than a single tool that is close but not“correct. But you're saying something different, which is using a tool, responding to the results of that tool, then using another tool.

Using the responses. I think we are saying very similar things. So there are times where you need, so like maybe let's take an example of, you ask the model to delete a file in a specific folder.

It might just attempt to try to delete it directly, or it may say, okay, let me first see where I am. So it might execute PWD, and then based on that, it will say, okay, now I need to go to that folder, so CD to that folder and then delete, right? So this is like multi-turn.

So there are many cases where we need multi-turn. You cannot do a, it's basically not feasible in a single turn because you need to wait for the response. I guess at the other, again, similarly in deep research, the model first needs to, for your query, it needs to break it down into multiple subqueries.

So the idea is that RL produces models that recognize multi-term path to solving a problem, as opposed to either giving up or hallucinating an API that doesn't really exist, that only uses the information they have single turn, that kind of thing.


( Hallucination aint to musch a problem cuz reward only with proof otherwise penalty plus agents supervise each other and are incentivized to call out others doing stuff wrong cuz of reward and that’s the dance of hallucinations in the end assent it ??? )  

Exactly. Got it.

Okay. I want to talk a little bit about MiniChart and MiniCheck as well.

So basically, to give context, MiniCheck is a model that is trained to detect hallucinations. It's a specific problem called grounded factuality. Basically, if you take, especially in drag systems, you have a context which the model looks at and produces an answer or basically a claim.

This particular model is good at checking if this claim is supported by this context or not. And so that's the MiniCheck model. And the reason we train that is...

And it's often done today just using general models. You give the model the response and you give us some context and say, hey, is this justified by the context that you have available?

Exactly. So people use GPT-40 or whatever it is. The advantage of using the MiniCheck model is it's actually, we do measure on a benchmark and it's actually better than GPT-40 in this task.

Then it's actually way cheaper because it's a 7B model. GPT-40 is like, I don't“know how many parameters. Also, it gives the latency is like 100 milliseconds.

In fact, if you use modern GPU, maybe it's even smaller, right? So it can be used as a guardrail because of its latency or you have a lot of data, you can go through it and get faithfulness metric and things like that. So anyway, the reason we train this is like, it's actually useful in data curation, where you are curating data and you are generating a lot of synthetic data, and so you want to be able to filter out bad quality data.

So that's the reason we train this. Also, to showcase that even the fact that we can train such models and basically distillation actually works, this model is distilled and so it actually outperforms the teacher model. So it's also like a proof of concept that fine tuning.

People are very reluctant to fine tune models, but this is another way to showcase that it works. And MiniChart is kind of also similar, is like it does like Q&A on charts. And we are able to train a 7B model, and it's much better than existing 7B models.

So it“achieves the level of like Cloud 3.5 and Gemini, I think 1.5. So again, the goal there is to show that good quality, good quality data and data curation helps. We did use a lot of synthetic data, and we trained that model.

Awesome. And so when you say Q&A on charts, this is like you've got a set of financial reports, and you pull a chart from a financial report, and you are asking questions about the trend that's illustrated in the chart, that kind of thing.

Yeah. Basically, you take a complex chart, it can be an infographic, all sorts of things happening there. But typically, of course, you cannot convert it into Markdown.

People try to do that. That doesn't work. So you need a vision language model.

So these become expensive. And so we have this model, which is actually pretty good. So we have a playground in our website, which people can upload and see that the model actually does.

It's able to answer questions, it's able to do math. You can ask it, okay, what's the average across many quarters? Or it does all sorts of math.

The next thing we are thinking“is also, it should be able to use tools. In this case, the model itself is doing the math, which can sometimes be error-prone, but we can have a situation where the model says, okay, in order to compute the average, I get these numbers and then it calls the tool to get the average and then gets back the response. That's something we'll be doing in the future.

Is the main use case for MiniChart similar to MiniCheck and that it's part of an eval loop for rag type systems?

MiniChart is slightly different in that it now is like a useful model. It's in itself is like a useful tool for an agent. Again, I go back to the deep research agent is like, it knows how to do web search and things like that, but also it knows how to, when there is a graphic, it knows, okay, this is the specific model it needs to call.

So similarly, when we want to build an agent that does a whole bunch of things, if it encounters a graph, it's going to call this model.

How many folks is Bespoke now?

We are less than 10. Yeah“, it's basically two co-founders and a bunch of interns and full-timers. But of course, we are hiring and growing, yes.

We did raise funds last year, but we haven't announced it, but it's actually about a year now. We raised fund end of April, so it's been a year.

And for a startup AI lab, what's the business model? Are you doing consulting with enterprises around the projects that you publish, or are you worried about revenue sometime in the future? Like, how do you think about that?

We are definitely thinking through how to get revenue. So ultimately, our goal is to build a product that makes recurring revenue, right? So consulting is...

So more than consulting, it's like we do have design partnerships, which kind of help us build the right kind of tooling, right kind of models, right kind of things we need to build. So that's something we are doing. And then, of course, we have a bunch of tooling now on data curation, and then we are also building things on RL and so on.

So that's something we will be monetizing.

In terms of future directions, we talked about kind of ways “that you envision extending some of these various projects. But in terms of this overall goal of allowing people to achieve frontier level performance without using large expensive slow frontier models, like what are some of the next steps in that broad trajectory?

Right, so we are splitting that into SFT and RL. For SFT, we focused on data curation, so we have a bunch of tooling around that. Now we are focusing on RL.

So basically, perfecting how to do RL and build agents. We get a lot of traction and pull from people trying to build agents. They are kind of frustrated prompting models.

So we are basically building a whole bunch of tooling on how to do RL effectively to build agents. That's our differentiating factor because everybody else is building agents by prompting. So we are building an ecosystem of good models as well as good tooling, everything put together.

We want to make it easy for people to build agents. We are also building some agents ourselves, so it's the full package there.

Very good. Well, Mahesh, thanks so much for jumping on and sharing a bit about what you're working on.

Improving Multi-Turn Tool Use with Reinforcement Learning
Bespoke Curator
Bespoke-Minicheck
MiniChart Playground
Bespoke-Stratos-32B
Scaling up Open Reasoning with OpenThinker-32B
Open Thoughts
Berkeley Function-Calling Leaderboard (BFCL)
Welcome to the Era of Experience
verl: Volcano Engine Reinforcement Learning for LLMs
The Crux: How Leaders Become Strategists
Data-Centric AI: A Data-Driven Machine Learning Approach
The Bitter Lesson
DeepSeek-R1
DeepSeek-R1-Distill-Qwen-32B
DeepSeek-R1-Distill-Qwen-7B
Introducing deep research
OpenAI deep research

