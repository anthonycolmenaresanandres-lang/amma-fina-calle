using NUnit.Framework;
using ShadowDoors.Runtime;

namespace ShadowDoors.Tests.EditMode
{
    /// <summary>
    /// Warning-ladder contract for the Offering: the plea on the first coin, the
    /// warning on the second, the turn on the last; text escalates every coin.
    /// </summary>
    public class CoinOfferingTests
    {
        [Test]
        public void VoiceLadder_PleaThenWarningThenTheTurn()
        {
            Assert.AreEqual("please_dont", CoinOffering.WarningLineFor(1));
            Assert.AreEqual("leave_them", CoinOffering.WarningLineFor(2));
            Assert.AreEqual("it_knows", CoinOffering.WarningLineFor(CoinOffering.CoinCount));
        }

        [Test]
        public void VoiceLadder_SilentInBetweenAndOutOfRange()
        {
            Assert.IsNull(CoinOffering.WarningLineFor(3));
            Assert.IsNull(CoinOffering.WarningLineFor(4));
            Assert.IsNull(CoinOffering.WarningLineFor(0));
            Assert.IsNull(CoinOffering.WarningLineFor(-1));
            Assert.IsNull(CoinOffering.WarningLineFor(CoinOffering.CoinCount + 1));
        }

        [Test]
        public void TextLadder_EscalatesEveryCoinAndEndsOnTheTurn()
        {
            Assert.AreEqual("please... don't.", CoinOffering.WarningTextFor(1));
            Assert.AreEqual("put them back.", CoinOffering.WarningTextFor(2));
            Assert.AreEqual("PUT THEM BACK.", CoinOffering.WarningTextFor(3));
            Assert.AreEqual("...", CoinOffering.WarningTextFor(4));
            Assert.AreEqual("IT KNOWS WHAT YOU TOOK.", CoinOffering.WarningTextFor(CoinOffering.CoinCount));
            Assert.AreEqual("", CoinOffering.WarningTextFor(0));
        }
    }
}
