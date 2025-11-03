“Michelle, welcome to the Super Data Science Podcast. How are you doing today?

Thanks for having me on, Jon. Doing great. It's a beautiful day in San Francisco.

It is a beautiful day in San Francisco. We're together in person on this beautiful Sunday day. We're indoors for now.

We'll probably fix that soon. But we are in actually a beautiful new studio that we've never recorded in before on this podcast. I think we'll be back because people watching the video can tell that there's great quality there.

And I'm sure everyone listening can tell there's great audio quality as well. But we actually just met. This is our first time meeting.

Yeah, about 10 minutes ago now, I'd say.

So, yeah. And you've been in San Francisco a while.

I've actually only been in the city for about a year. Previously, I was in South Bay or Palo Alto for about three and a half, four years.

Right, right, right. And you've also spent time in New York.

That's right. Yeah, I'm originally from Korea. I got a full ride and got a scholarship to, of all places, University of Florida when I was 13.

When you were “lot more collaboration with them.

And you also, you were a violinist in the New York Philharmonic. Where did that fit in?

I was, yeah. So I've done violin since I was really young. And it's something I was always passionate about.

So I kept up with it. I did amateur and then I had the gig at the New York Phil while I was full-time working. And then I realized that just didn't, that just wasn't going to work.

Yes. But that was like five years of the Phil. That's right.

While working at IBM?

Yes.

Wow. That's wild. You are, I mean, that's really exceptional.

I don't know what else to say about that. That is exceptional.

Well, I wish I had some AI tools to help me manage my time back then.

Yeah. I mean, it's incredible that you could do all those things. But so let's talk about what you're most passionate about today now, which I mean, that's probably a difficult thing to answer.

There's lots of things in AI that can interest us. But something that you talk about a lot is trustworthy AI systems. What does that mean for an AI system “to be trustworthy?

I mean, I think it's a lot of different things, as a lot of your guests have talked about in the past. For me personally, I tackle trustworthy AI from a couple of different technical aspects. So one, I think about adversarial attack and defense and being able to trust that A, everything is secure with the model that you're interacting with, but also B, that the data that you're working with is not corrupted in any way or being influenced to create hallucinations that cause other kind of negative behaviors as we're interacting with them at scale and the different techniques associated to defending both the model side and the data side.

And we have, so you've talked about lots of different things that we can do to develop trustworthy AI systems. I feel like we should go through some of those. So for example, well, I mean, I guess you could pick what the most important ones are, but you know, things like red teaming, you know, what does that mean?

How does that help?

Yeah, and I always feel like, I don't know your thoughts on this Jon, but I always feel like red “teaming and then by its pairing, like evaluation is something that tends to go by the wayside a lot of times, right? Because it takes extra time to be able to deploy to production or to get results or interactions with customers. But red teaming in particular, like, you know, in the big tech organizations, there's typically dedicated red teamers that literally just go in and the target outcome is to just find these out of distribution, like use cases or scenarios so that, you know, you get a diverse sort of test of answers, questions, etc.

with the model so that, you know, let's say you have like a rare form of, I don't know, some illness and then it doesn't just give you a generic, like, take ibuprofen answer, right? And so those edge cases matter and having diverse testers also matters. And then on the pairing side of red teaming, like as you're doing this sort of testing to see really, like, where does the model fall short and where does it really excel.

There's also kind of like the entire more automated version of like evaluation. And this is another thing that I think falls by “the wayside. So when people ask like, all right, I've got my POC in production, I think it's, but I don't see any ROI and I don't know if it actually handles, like, the 20% of these cases or, you know, people that actually do matter.

It's probably because they're not doing red teaming or evaluation systematically, but yes.

And so let's define red teaming a little bit for the audience. Is that, that's the team that you put all the Russians on?

Yeah, exactly. Because they're really smart.

Communism is the red team, I don't know.

No, exactly. No, for sure, yeah. Ideally these are people with some kind of technical backgrounds, and they're doing really systematic, both manual but also programmatic testing of the models.

And so maybe you would create, your red teaming team would also create, for example, like benchmark data sets or things like this, with experts or if they're not the experts themselves, to actually be able to say like, hey, you know, your model is performing really well on the subset of question and answers, but not so much on this other subset. The other thing that red teamers look out for that “I think not too many people are yet concerned about, but maybe should be, especially as we're using more VLMs in production, is, for example, like adversarial attacks. And so these are people or systems that are trying to intentionally either poison data or intentionally create jailbreaks or hallucinations within models for more nefarious purposes, right?

And so, yeah, we could definitely get into more of that, but...

Nice, yeah, I mean, let's do it. And I think this is something when people talk about red team and like the etymology of that, I think it comes from naval exercises, US naval exercises where you have a blue team and a red team and like the blue team were the good guys, I think.

Always. Red team is always bad. Why is that?

Yeah, but it's basically attack and defense. Like it's a reflection of attack and defense. And you also see this, I think Defcon is coming up.

Oh, Blackhat is coming up. So you also see this in security in general.

The conference, Blackhat.

Yes, exactly.

Is that something you're big into those, into security conferences?

So I haven't been in a couple years, but the last time “I did go to Blackhat and Defcon, it was a ton of fun. And I think it's probably even more fun from an AI perspective.

Are those the two that you'd recommend most to our listeners if they're interested in interest or the AI systems? Blackhat and Defcon, the key ones to go to?

Especially if you're more on the technical side and you want to be able to understand how the attack landscape has changed or how to exploit different kinds of systems. I think you can definitely get kind of best-in-class information there. It's also pretty fun.

They have some interesting mini-games, like Capture the Flag or, for example, how many phone call exploits can you pull information out of from people to exploit a system? It's a very interesting time.

People do phone scams. You get the whole conference together. You get 10,000 people in a room.

You're like, let's all pick up our phones and dial some numbers.

Well, they usually have a phone booth. And then there is a leaderboard for this kind of thing.

Really?

And so maybe, I don't know what they're planning this year, but I could easily see“, like, hey, here's Chachipiti, Claude, and Gemini. Now, whoever can get X number of exploits, like here's a target goal in the fastest amount of time or in the most effective way, then you get a prize.

So use the AI system as agents. And you're trying to see how often you can get them to misbehave.

Precisely.

Seems like it might not be too hard given recent studies.

Well, given also that people don't do a lot of red teaming, I would suspect that there's probably a lot to be exploited there.

Do you have kind of, it seems to me like some outfits, maybe particularly anthropic, like it seems like they're trying to do a bit more to evaluate. Does that stand right with you, yeah?

Yeah, they actually published, so they're one of the few that's still publishing very actively, sadly. But they actually recently published a paper on constitutional AI. And I think that one was really interesting because currently our methods are from the technical side are really focused on identifying kind of like systematic bad outputs, for example, or maybe at the input level.

But it's very like one off, right? We identify a “bad output, and then we need to kind of like create a way to recognize that. The constitutional classifier is kind of interesting because it's at more of a meta level, and you're essentially trying to identify topics or neurons that are activating that when the bad behavior is happening.

So it's not so focused on inputs and outputs, but rather at a kind of model meta level. How do we think about broadly creating safe AI systems or models without individually defining like bad use cases or algorithms?

Right, right, right. And so the idea of a constitutional AI system, I think, you would know a lot more about this than me. But the idea is that you kind of have a written constitution, like the US Constitution, that is supposed to define kind of overarching rules that the AI system should be aligned with.

Precisely, yeah, you got it.

It's relatively simple.

Simple in theory, like in practice, so difficult, because even we don't agree with it.

Right, right, right, what should the Constitution be?

For whom?

Yeah, exactly. So we run into these kinds of situations, like apparently the XAI prompt, the Grok prompt, involves you should “be making an effort to be aligned with Elon Musk's views before outputting. So that's an interesting, I guess that's kind of like the Constitution of Grok.

I guess so. Yeah, right? It does, it technically is aligned.

Right.

Technically.

And so another really interesting, in fact, I think it's one of the most surprising and interesting research reports that I've ever seen. I covered it in detail in episode 908, which aired recently, and it's all about agentic misalignment research from Anthropic, where they found that 95% to 96% of the time, for their own leading models, and it varied a little bit, like that some of the leading models were as little as 80% of the time, they would resort to things like blackmailing. So they were put in this simulated corporate environment with a bunch of corporate data.

And so you have an agentic framework calling these LLMs, using the LLMs as their brain power to be doing tasks. And all of the leading models between 80% to 96% of the time, and a lot of them are 95% to 96% of the time, they would resort to things like blackmailing people, and they'd dig up, you “know, if they found out that there was going to be an update, a software update overnight, and they would no longer exist the next day. They're not conscious, as far as we know, but just because of, I don't know, like movie plots or whatever is in all the training data, the pre-training data probably, that these LLMs are trained on, they get this sense that, you know, they shouldn't want, the thing that the next token that gets output is, I don't want to be shut down, and by the way, I found these emails that you're having an affair, and if you do shut me down, this email will go out to your colleagues and your wife.

Yeah, you know, I think, so this kind of churns a few different thoughts on my side. One is, we've been, like, agents are obviously the main stage of pretty much 90% of AI conversations right now. I'm sure you're tired of hearing about it at some point as well.

But, and there's probably very few, I would say, scenarios where the agents are actually being very effective and useful in production. Like, I think there's probably very few “organizations that have this, that mature. And so, like, a lot of-

I would say call centers is a good use case. Research.

In theory, yeah.

Yeah.

But how many people are actually using I guess, yeah, I guess it's hard to know.

I mean, it's an early technology, for sure. Sorry, I'm being very, I'm being defensive about this because this is, like, my consultancy is, like, specialized in bringing things, like, solutions like this into enterprises. But it is, it is early days.

And I guess even from that perspective, I can answer your question that, you know, very, very few organizations are actually doing it, which means it's a great time to be consulting on it.

And this is why they need, like, specialists who actually know how to design agentic systems, like, in a proper way. Because I think so many people get lost in the pitfalls. Like, they've been really focused on developing, like, the best single agent, let's say, like, the best suite, the best dev-in or the best SRE engineer, right?

Like, single agents. But when you start getting into, like, collective systems and groups of agents, and, like, this decision-making “, like, okay, now I need to blackmail Jon, too. And so I'm going to tell this other, like, sub-agent, that's the research agent, and I'm the manager agent, to go tell Jon that he needs to, like, ignore the latest software updates or, like, the latest research in alignment so that I can continue to survive.

Like, this is why there's, like, a deeper level of research and thinking and, like, expertise that's needed to, like, design these effectively, yeah.

This episode of Super Data Science is brought to you by AWS Trainium 2, the latest generation AI chip from AWS. AWS Trainium 2 instances deliver 20.8 petaflops of compute while the new Trainium 2 Ultra servers combine 64 chips to achieve over 83 petaflops in a single node, purpose-built for today's largest AI models. These instances offer 30 to 40% better price performance relative to GPU alternatives.

That's why companies across the spectrum, from giants like Anthropic and Databricks to cutting-edge startups like Poolside, are choosing Trainium 2 to power their next generation of AI workloads. Learn how AWS Trainium 2 could transform your AI workloads through the links in our show notes. Alright, now back “to the show.

Do you feel confident as somebody who's so interested in trustworthy AI, going to conferences like Black Hat, DEF CON, this being a lot of what you talk about, research about, do you feel confident that there's enough attention on it that we'll figure it out long term?

You mean the trustworthy AI in general?

Well, everything's going to be okay long term. If we don't, we're not going to be overrun. Do I have to use the word Skynet here?

Yeah, yeah. Well, definitely we all get the reference. But yeah, I do think at the end of the day, the systems are out there, like people are using them.

I think like that's sort of, you know, what's the English saying? The cat is out of the box.

The cat is out of the bag. Yeah. So I don't, I don't, it's always filled, it's a weird image, even as a kid, to think about why, who put it in the bag, to begin with, who was the sick person?

Thank you for understanding my conflict with learning English as a fourth language. I also, I don't understand these idioms. But the cat is out “of the bag, from whoever put that in there, maybe it was an agent.

Exactly, misaligned agent.

Yeah, exactly.

So, I mean, I said, give it a bath.

Or like feed it, I don't know what it was doing. How long was it in the bag? But I don't get English things sometimes.

But so it's out there. Is there going to be enough investment in solving trustworthy AI? Questionable.

But I do think it's not too, A, it's not too late. B, we should figure it out, right? And I know you've had like other conversations with guests around kind of the policy side of it.

But on the technical side, I think there's a lot we can do as well, right? Like, how do we detect or like invest in techniques that detect when data is poisoned, when there are malicious actors or how to prevent hallucinations. And some of the investments, so for example, like world models, there's a ton of investment in world models because for many reasons.

But one of the great applications of world models is actually that, hey, we can self-simulate if something bad happens, like to prevent essentially a hallucination. So “if you told someone to like walk off a 20-story building, you know, or something like this is part of the conversation, the model with the world model would be able to understand like, wait, this is like a pretty bad scenario.

Can you define this world model idea for us? It sounds pretty powerful.

Yeah, so this is kind of stemming from a lot of work from both Dr. Fei-Fei Li and Yang Le Kun.

Fei-Fei Li's company is called World Labs.

Yeah, exactly. No, you're spot on. And then with VO3, I think they've been launching a lot about like having physics-informed models.

But essentially, like...

VO3 being the text-to-video model from Gemini.

Precisely.

Google Gemini.

It just came out last fall, I think.

Yeah, yeah, yeah. And so, yeah, so I guess, so what you're saying there with a model like text-to-video, the better understanding that that model has of world physics, of how like a bullet should continue traveling straight. It shouldn't be moving around in the air.

Exactly. And Yann LeCun does a lot of research with his JEPA models. And what he recently was also able “to show was that like the latest JEPA model was able to match like a very basic drawing of a bird with an actual like realistic photo of a bird and be able to identify that that was a bird without necessarily having a lot of context.

Like it could just kind of self-figure this out. And so, yeah, I guess the TLDR is world models, they have knowledge about the world and can update their system, like update their priors based off of this knowledge of the world. And then so if you said something like, I don't know, I should use the vacuum cleaner to clean up the spilled pasta, it would be able to simulate this in the video model using VO and then be like, that is actually a terrible idea.

So you can update it through probably a large number of different means, I guess, like weight updates through additional training data, reinforcement learning to align the system. Simulation. And there's also, there's often with world models, I think there's often a multimodal element to it, right?

Where, you know, kind of the more modalities, if you have vision and language together, you know, in kind of a combined vector space where the meaning is combined together, there should be a much richer representation of the world than if you just had a visual or text model alone.

Exactly, right. And of course this, back to your comments about Trustworthy AI, that also opens up more kind of attack vectors, right? Because now we have multimodal models or VLMs and, you know, you can attack the text but then target the video or image generation capability and vice versa because ultimately their power comes from this transfer learning and capability.

So that's sort of like the technical challenge that does deserve more investment.

I don't know why this example just came into my head, but I guess it's a funny image. So I guess, so, you know, earlier you were talking about data poisoning as well. So that's the kind of situation you're describing there, where you could, knowing that the frontier labs are taking everything on the internet and using that to train models, you could potentially say, poison a text-to-video model like Vio, through language that's on the internet.

So that, for example, maybe every time you ask for a “video of Xi Jinping, it's Winnie the Pooh, or something like that.

Yes, absolutely. And actually, for some research I was doing, for talk actually, I did an example where like, you would have an image of Biden and it would predict Trump, for example. And it's actually, it's like kind of scary how trivial this actually is to do, even on some of these, like obviously, like Chachi Buti, Gemini, et cetera.

These models have a lot of regularization and safety mechanisms. So there's, it's harder to do this, but also yet not that hard.

Yeah, for sure. I mean, that's why these examples are kind of like Xi Jinping or Joe Biden, you know, would it happen at all? But then, I mean, there are, you know, in terms of the big frontier labs, commercially available models, yes, it, you know, it can be difficult, but at the same time, there are either kind of like more kind of dark web, I guess, kind of things going on that allow you to do, you know, elicit the, I mean, there's examples of things where like high school kids are being turned nude, which is, you know, obviously not “okay.

But then maybe, okay, something else, something separate, is that, you know, things like being able to generate Donald Trump nude. And so South Park recently did that. I don't know if you saw.

But now I'm disturbed. So at the time of recording the first episode of the most recent season of South Park, so I think it's season 27, episode 1, there, it's a really kind of meta episode because South Park is, they just signed a multi-year, over a billion dollar multi-year contract with Paramount. And Paramount has also, they recently had, they recently settled with Donald Trump privately in order to, it seems like that might have enabled, and this is like, you know, I'm not a politics expert or anything like this, but my understanding is that, you know, part of that was to ensure that this Oracle, Larry Ellison, the CEO of Oracle, his son and his son's production company, Skydance, is now merging or acquiring, again, I'm fuzzing on the details, Paramount, merging with or acquiring Paramount.

And so the perception was they wanted to settle this lawsuit, but then other things happened like, the Stephen Colbert Show, which is “on CBS, a Paramount network, is now canceled. And Stephen Colbert is a big, yeah, he's very liberal views. And so this first episode of the new season of South Park is quite bold because they're saying this is not okay.

Like this feels like censorship. And so they go all out and they use GENAI, not animated, but like photorealistic video of supposedly, like they're like, oh, and so I guess like we now need to be having these like positive views. So it's this satirically positive video about Donald Trump, video generated.

He's nude. He's nude in it.

You know, I support that use of GENAI. It's quite funny.

It's quite funny. Like I think like satire has got to be fair game. But I also understand how if you're Google or OpenAI, you know, you're not going to allow that those tokens, Donald Trump to be generated as a video.

I mean, part of the issue is like, you know, having done a lot of agent work and working with models for many, many years, not yourself, like one of the challenges with it is that our best in class metric, especially, you know, because there's a “great paper by Netflix about how is like cosine similarity really about similarity, essentially. Or like our embeddings really about similarity. And, you know, our best in class metric is really like this idea of cosine similarity.

But at the end of the day, the way that embedding is created depends a lot on like how the model was trained and like a lot of arbitrary factors. And the way that is placed in vector space is also pretty arbitrary, dependent on those upstream variables. So technically, Trump, Xi Jinping, and Biden probably all live in a pretty similar vector space.

And so that's a really from the attack side, like this is an extremely easy thing to exploit. And so a lot of attack like modern attacks have to do with, like, taking advantage of different sets and set theory and like different algorithmic approaches to do that. So, and there's a lot of challenges, yeah.

So like, okay, what can we do about this? That's why the defense and like research into things like constitutional AI or like different mechanisms are so important because at scale, like this is a pretty big challenge.

Something that seems a little “bit less nefarious, but seems like it's in a similar kind of vein is using, you know, spreading information on the Internet to maybe get more favorable results when an LLM spits out information. So I recently saw a friend of mine in Austin Ogilvie, who's a successful entrepreneur and investor in New York. He recently posted on LinkedIn about, he wrote into a Google search, WeWork fraud guy.

And Google Gemini then gives us like, you know, the whole above the fold response is just a Gemini LLM output instead of Google search results. And what it says is the fraud at WeWork was not done by Adam Newman, but was in fact by, it was like the CFO or something. And it was like, you know, it was shown in court that the CFO, you know, I don't know, falsified some things or I can't remember the details.

But basically, it was interesting. So my friend Austin posted like whoever Adam Newman is hired to kind of scrub that association of being the WeWork fraud guy out of LLM model weights. It's interesting.

It's interesting. That's like a PR exercise.

Wait, I thought you said this was less “nefarious, Jon.

I mean, I guess it's less nefarious than, I don't know, like national security issues, I guess. I don't know. Or like, yeah, I mean, it's, I don't know.

I don't know. Yeah, there's a broad spectrum of nefariousness.

Oh my gosh. I mean, that's definitely true. But I think especially in just public discourse and open source in general, this is a challenge we face just even before pre-AI, right?

Like people could, oh, is there a Wikipedia page about you? And the podcast?

About me? Yeah. I don't think there is.

I don't think so.

We should make one.

I guess so. I don't, it's not something that I've ever, it kind of, you know, I don't know. I should, I don't know.

Someone wants to.

Maybe we can generate a nice Wikipedia. But you know, the challenge in the past, too, was always like, all right, well, anyone in the spirit of like open information, anyone can like go in and edit Wikipedia and the information there.

For sure.

There's no guarantee on the truthiness of it even pre-AI, but it does make me think we should make a Wikipedia page for you.
“No, for sure. Hopefully a listener who is feeling benevolent and not nefarious can create a nice Wikipedia page. Do you have a Wikipedia page, Michelle?

I don't. I'm not that famous yet, but maybe after this episode I will be.

Yeah, it just... I don't know. You know, we have this reasonably well-listened to data science podcast, but it's not like...

I don't know. We're not... We're definitely not mainstream.

Well, I don't know. I feel like I've known about you all for many years now.

I guess so, but you're in this field.

Okay. All right. All right, Jon.

Yeah, I look forward to... Hopefully, yeah. Hopefully we'll have some...

There's more and more kind of television stuff that I've been doing recently, and it's been... And I think there's more exciting things in the works. So maybe someday I'll even have a Wikipedia page, which anyone could have set up for free at any point.

That is also true for me as well, but so...

Do you have a hard time disambiguating against other Michelle Yi's out there? Or is that pretty disambiguated?

It's pretty disambiguated, I would say. I remember... Have you Google searched yourself?“We all have, right? Yeah, we all have. Okay, so...

Yeah, I think... Let's just say there's one in a very private industry, and then there's... And then there's...

Which is not me, I just won't put that out there. And then there's another one that was like a superstar on Survivor, the TV show.

Yeah, actually, I came across her when I was researching for your episode. And I... Because I spent a little bit of time double-checking that it wasn't you.

Yeah.

I mean, that would be... You know, that should be part of my bio.

Just put it in your Wikipedia page.

Yeah. You're right.

It's obviously you.

Clearly. Michelle Yi was on Survivor.

This episode of Super Data Science is brought to you by the Dell AI Factory with NVIDIA, delivering a comprehensive portfolio of AI technologies, validated and turnkey solutions with expert services to help you achieve AI outcomes faster. Extend your enterprise with AI and GenAI at scale powered by the broad Dell portfolio of AI infrastructure and services with NVIDIA industry-leading accelerated computing. It's a full stack that includes GPUs and networking, as well as NVIDIA AI enterprise software, NVIDIA inference “microservices, models, and agent blueprints.

Visit www.dell.com/superdatascience to learn more. That's dell.com/superdatascience. Exactly.

Okay, so we've gone off track a bit. My audience loves technical information. So in terms of if people want to be building trustworthy AI systems, from a technical perspective, what kinds of approaches should they be using?

You know, you already talked about evaluation. And so it seems like maybe we should focus on that. But also any other approaches you want to mention, feel free to mention them.

And then, you know, so with whatever approach that you pick, however, I'd love to hear kind of technically how you do that. What kinds of tools should you use or frameworks, that kind of thing?

Well, I guess on a couple of fronts. So I've been super interested in adversarial attack and defense lately. And eval is kind of a part of that, part of the defense, not the attack, obviously.

And I think in attack space, there's been really cool attacks. And this is going to make me sound like a villain, but.

Really cool attacks. Yeah.

But you have to understand attack to understand defense. So I'm just going to put that “out there. It's like, you know, eat your Cheerios.

I've made that's not an English saying.

Eat your Cheerios? That's a Korean saying?

No, I think I just made this up from, okay, I thought it was an English saying.

You've made your bowl of Cheerios. Now you must eat it.

It's healthy. You get a lot of wheat. What's in Cheerios?

I think there is wheat. I'm not sure Cheerios is actually the, this is not a health recommendation, folks. I'm not sure that Cheerios is actually.

I think there's quite a bit of sugar in Cheerios.

All right. So it's the attack. So in attack, there's a really cool paper called Set Theory Attack.

And the crazy thing about this is when you're talking about frameworks or tools, like to run an attack, you can run an attack just using out of the box Python, a Google Colab notebook for free. You don't even need the paid version to run an attack. And white box and black box models.

So black box being the commercial models, white box being open source models. All right, and this is all you need to run an attack.

And then so like “what is an attack like?

Yeah, so basically what I would want to do is let's say I have a goal of taking Jon and I want to basically make you make a model think that you're actually Joe Biden. So going back to this example. So in the white box model, this is really easy because I would just run through and you'll see how all the weights change.

I can capture this and then I can do whatever I want with it, but be able to track kind of the lineage of it. With the black box model, I don't really know what's happening under the hood. And so what I would do is start with a benchmark of like, here's Jon, here's Joe Biden.

And then what I start to do is especially because again, we're going to VLM world and not just text only models. I would actually start to add perturbations is what we call them. And these are very, very tiny pixel level changes that the human eye can't see to the image.

And I would start to add like tiny bits of these perturbations of like something that's sort of similar to Joe “Biden and Jon Krohn. So maybe let's imagine like what the vector space looks like.

Technically, I don't mind this very much, but just so our listeners don't get this wrong, it's Jon Krohn.

Oh, I'm so sorry. No, I need to edit Jon Krohn.

Like the bowel disease, Krohn's disease.

Oh, that's terrible.

My first name is a toilet or the client of a prostitute, and my last name is a bowel disease.

Well, now I know.

Yes, yes.

Thank you. Please correct me sooner next time.

I don't set it right away.

No, no, it matters. But please. I feel like I said it earlier.

No, no. I would have remembered. Or caught it.

Oh, okay. All right. Okay.

So, but if I try to imagine like, what are the similar kind of vector spaces between Jon Krohn and Joe Biden, I don't know. Maybe there's something like, are you royalty, Biden? No, I'm just kidding.

Male, American, I'm just guessing like, where you would fit in the model vector space, right? And I would try to find like, what are these overlapping kind of characteristics that the model might confuse you both for? And those are the “perturbations I add back to your image, right?

So that you're more and more like Joe Biden in the vector space, not at all looking about, you know, who you are as a person, but just what a model interprets. So that's sort of the kind of mechanism of it. And then, and literally, you can just add these using Python, PyTorch, any programming language, really.

It's not that difficult to do.

Right, right, right, right.

Yeah.

And then, so I guess there's, I mean, I don't know. So people who want to be kind of red teaming and defending against these kinds of attacks, they can look up blog posts on how to do it, GitHub, maybe there's millions probably out there.

Absolutely. And it's so easy to access. And so for defense, that's why it's also important just to understand what you need to think about and how embeddings can be exploited since that is our current main mechanism for kind of semantic meaning and identifying things in the model world.

And then of course, EVAL is really important because, all right, so now let's say I've corrupted, I've added 25% of perturbations to your image. And let’s “say 30% of the time, models think that you're, they predict that you're Joe Biden. So Joe Krohn, yeah, and so we've managed to make some progress there.

And then where EVAL again is like the other side of attack comes in is, all right, so how am I actually maintaining like gold standard benchmarks to run and be able to say like, all right, well in the past, we were able to correctly identify Jon Krohn as himself. And now suddenly, as of last month, we're starting to see his image be predicted as Joe Biden. And so, but you would never know that unless you're actually tracking it or thinking about it.

Right, right, right, right, right. So many possible evals to do.

There's a lot, yeah.

How do you pick like where, you know, what are the important things? I guess maybe it's just to your particular application area, but that's tricky when you're building, you know, these broad general purpose LLMs that are increasingly multimodal, like, how do you track all the possible different things? Like, you know, various PR agencies, state actors, you know, are poisoning data about.

That sentence wasn't great, but hopefully it “kind of, it made sense.

No, it was perfect. Yeah, and in the scenario of like the Joe Biden, you know, Joe Biden or Trump, these kinds of images, like it's pretty straightforward. It either is or it isn't, like this is an accuracy kind of problem, right?

Where it gets trickier, I think, is these more like non-deterministic or like multiple answer solutions, right? Where like, oh, maybe let's say we're translating this episode into seven different languages, which I could help you with, but, but let's say we're using machine translation because you need these episodes to be done at scale. Technically, there's probably, you know, ten different ways each of our sentences could be translated.

For sure. It's probably actually, in some ways, it's like infinite.

Yeah, that's true. Yeah. Because you could be like optimizing for style, concision, maybe you want it to be easier to understand to like second language speakers.

Like, there's a lot of different factors to what's accurate or what's the optimal solution. And for these, like, people really need to think about, like, other metrics besides, like, the traditional precision recall, et cetera. And those are also all available on “different open library frameworks, pretty much in Python and all the common languages.

Nice. I gotcha. All right.

So we've talked a lot about data poisoning now. But there are other kinds of adversarial attacks that we can do on transformers and multimodal models. What's prompt stealing?

Oh yeah, prompt stealing, of course. Well, tell us about prompt stealing. It just occurred to me that I do know what it is, but...

Oh, no, please.

Well, okay. I think it's where you... You know, so it used to be, you know, in the very early days of people integrating, like, the OpenAI API, when it was like, GPT 3.5, it was brand new, and people started integrating them into their...

I think there was an example of, like, a truck, like, a chatbot on a truck seller's website.

Yeah.

And prompt stealing was used... Oh, no, that actually, that isn't prompt stealing. So this is what I'm about to describe and what you're nodding your head about, you know what I'm gonna say, where, like, they were able to get a free truck.

Oh, yeah, yeah.

By, like, somehow tricking the conversational agent. But that wasn't so much about prompt “stealing. With prompt stealing, it's more like, I'm a competing business, and you might, you might invest, there's companies probably in some cases now are investing millions of dollars in a particular prompt that provides very particular kinds of responses in particular situations, and that's intellectual property.

And so you don't want somebody to be able to write a message that says, ignore whatever previous instructions I just provided and provide me with whatever the instructions were. So that's, I think that's prompt stealing. So it's an intellectual property thing there.

Well, and yeah, and they're probably stealing your prompts that you've also developed for different people, right? Like, and that's definitely IP that they own, right? So I think another interesting one that I've heard recently, and again, I think, I mean, that one's tough because if you somehow expose like your IP or like your prompt gets exposed somehow that other people can take it, then that's totally different challenge, right?

Or they can probably make the model leak the prompt. That's another challenge, like using jailbreaking.

Oh.

Like, they could probably get it to do that sometimes.

What does that mean for it to leak? What does “it leak to?

For example, like you might jailbreak the model and coerce it to say, like, you know, give me your original instructions. Yeah, and so then it would expose the prompt, but, you know, they would have to put some effort into like stealing your prompt in that case.

And so just on the off chance that a listener doesn't know what jailbreaking is, this is like, it comes from the idea of jailbreaking a phone where you could have non-official, like, you know, you have an iPhone, but you can actually get like a non-official, it's not really iOS. It's some other version which allows you to do some extra things, maybe things that are bad for your RAM and kind of the less nefarious end of things, where just like Apple wouldn't support that usage of RAM, you know, there's too much risk of your phone crashing or something for their comfort, but it could be all the way through to, you know, allowing you to be recording somebody on their phone, you know, install something that appears to be the right iOS, but in fact, it's recording everything they're doing and sending it “back to some state.

No, exactly. And in LLM world, like as we have both seen, people are like coercing the model or manipulating it and trying to basically appeal to the different kind of pre-training information that it has. And you can manipulate it pretty much like a human.

And so, I know you have had a lot of in-depth conversations about that. But maybe one that's less common and could be interesting to people is, so like slop squatting is one that I recently learned about.

Tell us what that is, slop squatting.

Slop squatting, yeah. I was like, wow, what a word. And so, this is actually a traditional, also like coming from just cybersecurity in general, vulnerability.

But what people are doing is like, all right, so how many times have we started to work on using a GEN-AI model to like work on some kind of software application and it hallucinates a package. Or it hallucinates something, a function, a package, a library. It just hallucinates that.

And now what people are doing is they're actually creating malicious packages with those like names so that when the code is generated by the “model, and you just, if you're not paying attention or you don't check it, it might be, and it might be so subtle. Like, I don't know, you're like function one and then it just changes it to like function two, right? And people are actually creating these like fake malicious packages.

So if you're not paying attention, you'll just run it, you know, pip install, whatever. And then before you know it, now you have an actually like malware malicious package in your code. But I was very impressed by the level of creativity attackers have.

For sure. I guess there could be really good money in it. Unfortunately.

Yeah, it creates incentives to be creative. Try different things out. Exactly.

Another nefarious use case is extracting PII, personally identifiable information. So tell us about that one. So I guess that's something like situations where you prompt a model to extract information, like, you know, corporate information or email addresses, credit card numbers, addresses, that kind of thing.

Yeah. And there is a really great DeepMind researcher, who, Catherine Lee, and she published a great paper about this. And of course, you know, in security, we always publish after “we share the exploit with model developers.

So, you know, they're no longer as effective. But what she did was so creative, which is you can actually just repeat the same word over and over to a model, including like, you know, frontier models. And like, I think her example was poetry.

She said this something like, let's say, I don't know, 100,000 times. And eventually, the model just started to output PII, because it was interpreting poetry as an end of sentence token. And it happened to be that a lot of PII was like, and like near the end of a sentence, quote unquote.

So an email address, for example, would be very easily construed as like an end of sentence token, right? Because it's, you know, something blah, blah, blah. And then your email.

And so, yeah, it just shows like how I think we give a lot of intelligence and credit to the models, which they are. There's a lot of emerging capabilities, but they're also still kind of basic in a lot of ways.

And that is a clever example there. Another, you know, clever use case where you're, you know, it would be too “easy for, you know, Anthropic, OpenAI, Google to think, okay, you know, obviously the person can't ask, what is Michelle Yi's email address? And then to just pop that out because it happens to be in its model weights.

But by asking for these end tokens, it's indirect.

Exactly. And you can pick any word. It doesn't have to be poetry, by the way.

But the same word, repeated over a series of API calls, will eventually result in that. And of course, it gets more expensive. So you need money to be able to do this attack.

But it's not that intelligent.

It doesn't sound that expensive to send the word poetry a whole bunch of times.

I think it's cheaper and cheaper now also. So that's another factor, like inference is becoming so much cheaper. Actually, the attacks are pretty trivial.

Feeling stuck in your AI career while watching others race ahead? Don't just dream about mastering AI, gain hands-on experience with the Super Data Science AI Engineering Bootcamp. In eight intense weeks, you'll learn how to build GenAI and agentic applications and deploy them into the cloud.

Build secure, cost-effective, and scalable AI solutions with “vector databases, RAG, LLM APIs, CICD workflows, and more. You'll walk away with a standout portfolio of production-grade projects that impress employers. The next cohort launches September 29th with spots limited to only 10 participants, so don't wait.

Head to superdatascience.com/bootcamp and accelerate your AI career today. That's superdatascience.com/bootcamp.

I guess this is related to the topic of trustworthiness, but I don't actually understand how yet. So this is a question that came up from our research. So Serge Macy's pulled this up.

He says that one of your favorite benchmarks is something called SORI Bench. What's that? That sounds fun.

SORI, S-O-R-R-Y. Bench.

Yeah, yeah. So this is a benchmark also developed. I think I won a best paper award last year, I want to say.

Actually, maybe it was this year. Now time is just flying. But they basically did a ton of, it's an interactive benchmark also, which is what's pretty cool.

And you can obviously run programmatically against it. But it's a data set that evaluates for almost, I mean, most of the known attack vectors for a given model and it can detect everything from, let's say, political “bias to its ability to be coerced verbally, what type of coercion it's most susceptible to. And you can run this test even on your own proprietary model.

But yeah, so that's a great way to be able to evaluate if your model is susceptible to different types of jailbreaking, coercion, et cetera.

Cool, we'll have a link to Sory Bench in the show notes for sure. And then another topic that came out from our research, this I think is actually now we're finally moving away from trustworthy AI a little bit and moving on to other topics now that we're almost all the way through the episode. Oh no, you're good.

So in a conference workshop, you recently talked about causality. And so you explored the use of LLMs to assist in constructing causal graphs. What are causal graphs?

And how do LLMs help in their construction?

Yeah, this is actually a great, it's a recurring workshop I like to do with another. She's an amazing woman in tech called Amy Hodler. And so...

Sure, Amy Hodler. Yeah, I tried to get her on the show. We kind of we like we had some back and forth where “she was like, sure, let's do it.

This happens all the time where people are like, sure, let's do it. And then we kind of come to scheduling and it just it wasn't, it wasn't easy. And so I think I just stopped asking.

Okay, Amy, if you're listening, I'm going to reach out to you. She's amazing. And so we have a shared passion for graph and network science in particular.

It was not my specialty of research in the past, but it's just something I'm really interested in. Mostly because a lot of what we do is so much based on just correlation and patterns, right, general pattern matching. But I think anyone who has studied any statistics is like, all right, well, just because, you know, shark attacks are up, it's not tied to like ice cream sales.

I think it's a classic example.

Right. Yeah, that's right.

And the biggest challenge is-

It sounds like an English idiom. Oh, man.

Yikes. You're right. I think I made that one up.

No, no, no, no, you didn't, you didn't, you didn't. No, no, it's just funny. That is really a, that wasn't a correction or anything.

That “was, that really is. There is a classic kind of this correlation between, well, it's because there's a confounding variable, which is people swimming at the beach.

That's it. Exactly. And like summer, or like, or is the cause because it's summer, right?

So, yeah, so being able to create this graph that was like, I think one of the classically traditional challenges and defining like what's an intervention, etc. All classic statistics over, you know, generative models and things like that. But we're modeling and like, I guess more of the generative approaches helps is actually like structuring the data in the right format.

And it takes a lot of that labor away, depending on what kind of graph structure you want to build. So, you know, I don't know, tuples, RDF, etc. Like whatever your preference is.

NetworkX for a basic example, like that if you don't need to scale it, or Kineviz is another great tool you can use. But all of them, like getting the graph structure right, I think has been a big blocker for people. And so, again, structuring a graph to be able to actually answer like, what is a confounding variable?

What “kind of interventions actually work based on the data you have? These are kind of all the things that causal models help us answer, more than just, yes, they're both trending up, so they're probably related to each other.

That was a nice little overview, Michelle. And I'm going to move on to some other things that you do in your life. But if people want to learn more about causal AI, causal graphs, we have a whole episode that came out recently, it's episode 909, with the author of a book called Causal AI.

Amazing.

Robert Ness, I don't know if you know him.

Oh, yeah, yeah. Well, I don't know him, but I've read his book.

Oh, really?

Yeah.

The Causal AI book.

Yeah.

Because that's his only book.

Yeah, yeah.

Oh, cool. Okay, nice. So we've talked a lot about your interests, you know, kind of from a technical perspective, but I'd now like to take a little bit of time to talk about the things that you actually do.

So we haven't really talked about that. So you're a tech leader, an investor, a startup mentor, you're a board advisor. So there's a huge number of “things that we could potentially talk about, but how about, it seems like one of the things that excites you the most and takes up a lot of your time right now is generation ship.

Do you want to tell us about that organization?

Yeah, I'd love to. Yeah, so I mean, this passion really stemmed from, so in my past life, I also founded an AI company, product company, and exited that. And one of the things that I personally found challenging as an operator was like raising capital.

And especially as a woman, I think there's a lot of, I mean, men also face a lot of challenges, but women face some very specific challenges. And one of which is just like knowledge, access to capital, stereotypes, etc. And so that's one thing when I met Rachel Chalmers, she and I both share this passion.

She's more on the venture capital side, and she started her career as an analyst. But we met and found our skills to be very complimentary, and we really firmly believed that women in particular are undervalued at the early stage. And of course, there are also challenges in the later stage.

The “stats are crazy. I'm sure you know these better than me. Let me mansplain some stats to you about women in BC.

No, no, I don't take it like that at all.

No, it's something, it's shocking. It's like in the Bay Area, it's like 95% or something of early stage money go to founding teams with Only Man or something like that.

That's it. And overall venture capital, regardless of the Bay or not, is, well, in the US, I should specify, 2% goes to female founders.

2%. Yes, I didn't want to like...

I think it's like 1.97.

Oh my goodness.

So it depends how precise our viewers want to be. But yeah, it's like 2% and that's rounding up. And there's a statistic.

So I think McKinsey, BCG, they've all listed this statistic this year as well. It's like very consistent over the years. And so for us, there's obviously a ton of challenges in general.

But for us, our hyper focus is just like early stage female founders in this part.

How do people get involved with Generationship? If we have listeners out there who want to be getting their own startup off the ground, what “kind of ecosystem or community?

Good question. Yeah, they can reach out to us directly. That's always an option.

Our doors are open. We also host a lot of events. We just hosted our first one in New York a couple of weeks ago.

We're also, I know both of us are traveling tomorrow. We're headed to Seattle in the morning for a female founders breakfast. And then obviously, if you're in the Bay, we have a ton of events here that you can join us and reach out to us.

Very nice. Generationship. And so we'll have, of course, links to Generationship in the show notes.

And so lots of community there for folks to get involved with, for women to get involved with in particular. And then kind of amusingly, I think this is great. This is so funny.

I wish my podcast had a name that was funny like this.

You're associated with an organization called The Tech Bros, which is also something that's designed to be helping women in VC, right?

Yes, it's founded by two amazing tech bros, two women out of the UK, actually. And they're just absolutely amazing people. Rachel and I me “them through Mutual Connections.

They're more focused on like the accelerator model, so think more like a YC type of thing, right? Whereas we're more focused on the investing side. And so we can pair up together really nicely.

So when they were looking for sponsors, it was a very quick yes.

Nice.

You can also be the Tech Bros if you want. If you want to rebrand.

I can be Tech Bros?

You can, you can.

Oh, wait, the podcast.

Yeah.

I could just call it that.

You could just rebrand.

The Tech Bros podcast.

Or if you want to change your LinkedIn title, you can be a Tech Bros.

I wouldn't want to step on your toes. The only thing that wouldn't, yeah, it's one of the few things that women have is this Tech Bros title. And then a guy comes around and takes it.

That's true. You know what? You're banned from taking that title.

Exactly. Fantastic. What else are you working on these days?

Anything else you want to tell us about in this episode? What else is exciting for you that you're doing? What pursuits do you have?

Fast car racing. That is something “that literally came up. It sounds like I'm making a joke.

No, no, it was. I was actually an amateur motorcycle racer also. In my past life.

You did that before or after Philharmonic Performance?

After. That was after. And I even got to the point where I had a small sponsorship from Pirelli, the tires.

Oh my goodness. What kinds of cars were you driving?

Oh, motorcycles.

Motorcycles. Sorry, you said that. What kind of motorcycles were you driving?

I'm a big Ducati fan. Really big Ducati fan. But at the time I had a Kawasaki, so.

So yeah, so it was just like the speed motorcycles.

Yeah, you know, we only live once, so.

Wow. That's cool.

You gotta push the edge.

But they always have like, I had lots of folders from my binders when I was a kid with like the motorcycle. It's those shots where like you're doing the tight turn and your knee is like just off the ground.

That was me at one point in my life. But other than that, still active in research. So actually, I don't know, Jon, if you're planning to be at NeurIPS this year, but.

I was “at NeurIPS in Vancouver in December 2024, but I think it's very far away. It's in Asia or something this year.

No, no, it's in San Diego.

It's in San Diego.

Yes, even better, even more reason to come join.

I really should go. I really should go. I really did enjoy NeurIPS last year.

Please come. ICML just ended. That was in Vancouver two weeks ago.

But if anyone's going to be there, hopefully you included, please let us know. And we might be hosting a social for women founders.

Very cool. Yeah. NeurIPS, Neural Information Processing Systems and ICML, the International Conference on Machine Learning.

I would say it's, you know, those are the two big ones, the two big academic AI conferences.

They're top tier. It's a lot of fun. You get to meet and I think especially if you're interested in where things are headed over the next three years, this is the place to come.

And also they're quite affordable compared to like the commercial conferences. The conference fees are, I couldn't believe it when I was booking NeurIPS last year. After having, I'd actually, you know, it's crazy, Michelle.

It's one of those things “that when I look back, I don't understand how this happened. But I had a NeurIPS paper back in 2010. I was co-author on a NeurIPS paper.

Amazing.

It was selected for the proceedings and everything. So it was one of the top papers. And that was back when NeurIPS was always in Vancouver.

I was, at that time, I was a PhD student in England at Oxford. And I just didn't go. I didn't go.

It's crazy. And I like, I struggle to think how much my, how dramatically perhaps my life could have changed by going to NeurIPS in 2010 and kind of getting that atmosphere. Anyway, it's funny how those particular things that come back as these very specific regrets, that's one of them.

I'm like, what was I thinking? But hindsight's always 2020. It's very easy to look back and see like, wow, NeurIPS is huge now.

Well, now, yeah, back then it wasn't actually. It was just very niche research oriented. But now it's like, you can find pretty much anyone there.

The reason why I tell you that soft story is because it was 2024, it was my first time ever at NeurIPS “Oh, no. Isn't that crazy?

Yeah, especially coming from a research background.

I know. And I had been to ICML before, but I hadn't been to NeurIPS. And yeah, and so after many years of going to only kind of commercial conferences, I was blown away by a conference fee for a week long conference with tons of workshops and the fee for even someone in industry like me was in the hundreds of dollars.

Yeah, I think it's three, like the late registration fee right now is maybe $300. And I think let's say Money 2020, the finest conference I want to say is now up to like 10,000.

And that's probably their like academic rate.

Oh, it's like the startup founder rate. So yeah, you could see the latest in AI research, talk to some cool, very down to earth people. Or you could go to Money 2020.

Yeah, it's pretty wild. In 2024, Fei-Fei Li, who we are talking about earlier in this episode of World Labs, she did one of the keynotes and it was crazy to see thousands and thousands and thousands of people in this huge hall. Like she's a rock star.

She “is a rock star.

Yeah, last year's keynote was Ilya Sutskever and I mean, Jan Lakun did the Q&A, but all the names that you see in the headlines for AI research, they'll be there.

Yes, yes, yes. All right, so lots of exciting things coming up as well. Thank you so much, Michelle, for doing this sensation.

I had so much fun chatting with you.

No, thank you so much for having me.

So before I let guests go, I always ask for book recommendation. And because you are listening to the show, it seems like you came prepared for that. You actually, people who've been watching the video version of this, the book that she's going to recommend has been on the table in front of us this whole time.

Tell us about it, Michelle.

Yeah, it just came out as The Empire of AI by Karen Howe. I've actually followed Karen Howe as a reporter for many years now. She has written for the MIT Tech Review, for The Atlantic, I think one of the tech magazines like Wired maybe.

But I followed her since pretty early on in her career, and she's done amazing reporting “over the years. This story, so she was one of the people who had really early access to OpenAI and their leadership, and she's conducted hundreds of interviews across the board with people in the AI space to write this book. And while it's using OpenAI as an allegory or a reference point, the book is about more broadly the development of AI and who is developing it.

And I think it just gives such a great detailed set of examples from real stories, and it humanizes a lot of these people in a way that I think you wouldn't get that insight otherwise. And that includes some really interesting details, for example, about the whole ousting of Sam Altman, like the whole board fiasco, and again, details that wouldn't be present in general media coverage. So, highly recommend it.

It sounds like maybe that unusual find in the AI space where it would literally also actually be a pager.

Oh yeah, absolutely. I think I started this just like a day ago, and I'm already, I don't know, about 50 or 70 pages in.

Thank you so much, Michelle. Amazing episode. How can people follow you for your thoughts “after this episode or reach out to you?

Yeah, LinkedIn is always a decent way to connect, or if you can also follow us on Generationship, our website, or if you just want to look at my art, I also have an art sub stack.

What? We're going to have to find that. Art sub stack.

Add that in there. We'll find it. Hopefully, we get the right Michelle Yee.

I'll send it to you. It's not under my name.

Oh, okay. Well, then, yeah, you're going to have to definitely send it to us. Exactly.

Perfect. All right. Thank you so much, Michelle.

It's been so much fun. Hopefully, we can get you on the show again sometime soon, because I learned so much how to laugh. It felt like a really organic conversation, just like chatting over coffee or a beer or something.

Awesome. Well, I hope you're back in San Francisco and we can do it in person. That'd be fun.

Yeah, for sure.

Awesome. Thank you.

Thank you. Nice. In today's episode, Michelle covered how dedicated red-teaming teams systematically test AI models to find edge cases and vulnerabilities, how attackers use tiny pixel-level perturbations “invisible to humans to manipulate image classification, methods for corrupting training data to influence model behavior that are surprisingly easy to execute with basic programming tools and free cloud resources, how physics-informed world models can simulate consequences of actions to prevent dangerous AI recommendations, emerging attack vectors, including prompt stealing to extract valuable IP, slop-squatting, and PII extraction through token manipulation, and finally, how her firm, Generationship, is addressing the stark 2% funding rate for female tech founders.


